import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ReferralCode } from '@prisma/client';
import { getPrismaClient } from '../../clients';
import { getRandomIntInclusive } from '../../utils';
import { AutocompleteHandler, CommandHandler } from '../command';
import { parseDate } from './parseDate';
import { searchServices } from './services';

export const data = new SlashCommandSubcommandBuilder()
  .setName('random')
  .setDescription('randomly get a code/link for a service')
  .addStringOption((option) =>
    option
      .setName('service')
      .setDescription(
        'service to refer(type more than 3 characters to see suggestion)'
      )
      .setRequired(true)
      .setAutocomplete(true)
  );

export const autocomplete: AutocompleteHandler = async (interaction) => {
  const searchTerm = interaction.options.getString('service', true);
  if (searchTerm.length < 4) return;

  const options = searchServices(searchTerm);
  interaction.respond(options);
};

export const execute: CommandHandler = async (interaction) => {
  const service = interaction.options.getString('service', true);

  const prisma = getPrismaClient();
  const referrals = await prisma.referralCode.findMany({
    where: {
      service: {
        contains: service.trim().toLowerCase(),
      },
    },
  });

  const [expiredIds, filteredReferrals] = referrals.reduce<
    [string[], ReferralCode[]]
  >(
    (total, referral) => {
      const [parseDateCase] = parseDate(referral.expiry_date.toString());
      if (parseDateCase !== 'SUCCESS') {
        total[0].push(referral.id);
      } else {
        total[1].push(referral);
      }

      return total;
    },
    [[], []]
  );

  // SOMETIMES try to clean expired referral codes
  try {
    if (expiredIds.length > 10) {
      await prisma.referralCode.deleteMany({
        where: { id: { in: expiredIds } },
      });
    }
  } catch (error) {
    console.error(error);
  }

  const referral =
    filteredReferrals[getRandomIntInclusive(0, filteredReferrals.length - 1)];
  if (!referral) {
    return interaction.reply(`There is no code for ${service} service`);
  }

  await interaction.reply(`Service ${service}: ${referral.code}`);
};
