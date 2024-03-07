import { Guild, SlashCommandSubcommandBuilder } from 'discord.js';
import { getDbClient } from '../../clients';
import { getRandomIntInclusive } from '../../utils';
import { logger } from '../../utils/logger';
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
  const guildId = (interaction.guild as Guild).id;

  const db = getDbClient();
  const referrals = await db.referralCode.findMany({
    where: {
      service: {
        contains: service,
      },
      expiry_date: {
        gte: new Date(),
      },
      guildId,
    },
  });

  if (referrals.length === 0) {
    logger.info(`[referral-random]: There is no code for ${service} service in the system.`);
    await interaction.reply(`There is no code for ${service} service in the system.`);
    return;
  }

  const referral = referrals[getRandomIntInclusive(0, referrals.length - 1)];
  logger.info(`[referral-random]: Found referral code for ${service}, code: ${referral.code}, by user ${referral.userId}`);

  let displayName = referral.userId;
  const member = await interaction.guild?.members.fetch(referral.userId);
  if (member) {
    logger.info(`[referral-random]: Found member ${member.displayName} from userId ${referral.userId}`);
    displayName = member.displayName;
  }

  await interaction.reply(`Service ${service}: ${referral.code} added by user ${displayName}`);
};
