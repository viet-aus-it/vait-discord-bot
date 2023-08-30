import { SlashCommandSubcommandBuilder } from 'discord.js';
import { getPrismaClient } from '../../clients';
import { getRandomIntInclusive } from '../../utils';
import { AutocompleteHandler, CommandHandler } from '../builder';
import { searchServices } from './services';

export const data = new SlashCommandSubcommandBuilder()
  .setName('random')
  .setDescription('randomly get a code/link for a service')
  .addStringOption((option) =>
    option.setName('service').setDescription('service to refer(type more than 3 characters to see suggestion)').setRequired(true).setAutocomplete(true)
  );

export const autocomplete: AutocompleteHandler = async (interaction) => {
  const searchTerm = interaction.options.getString('service', true);

  const options = searchServices(searchTerm);
  await interaction.respond(options);
};

export const execute: CommandHandler = async (interaction) => {
  const service = interaction.options.getString('service', true)?.trim().toLowerCase() ?? '';

  const prisma = getPrismaClient();
  const referrals = await prisma.referralCode.findMany({
    where: {
      service: {
        contains: service,
      },
      expiry_date: {
        gte: new Date(),
      },
    },
  });

  if (referrals.length === 0) {
    await interaction.reply(`There is no code for ${service} service`);
    return;
  }

  const referral = referrals[getRandomIntInclusive(0, referrals.length - 1)];
  await interaction.reply(`Service ${service}: ${referral.code}`);
};
