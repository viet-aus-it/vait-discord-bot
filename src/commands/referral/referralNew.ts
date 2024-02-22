import { SlashCommandSubcommandBuilder } from 'discord.js';
import { getDbClient } from '../../clients';
import { logger } from '../../utils/logger';
import { AutocompleteHandler, CommandHandler } from '../builder';
import { parseDate } from './parseDate';
import { searchServices, services } from './services';

export const data = new SlashCommandSubcommandBuilder()
  .setName('new')
  .setDescription('add new referral code/link for service')
  .addStringOption((option) =>
    option.setName('service').setDescription('service to refer(type more than 3 characters to see suggestion)').setRequired(true).setAutocomplete(true)
  )
  .addStringOption((option) => option.setName('link_or_code').setDescription('referral link or code').setRequired(true))
  .addStringOption((option) => option.setName('expiry_date').setDescription('when the code/link expired (DD/MM//YYYY)').setRequired(true));

export const autocomplete: AutocompleteHandler = async (interaction) => {
  const searchTerm = interaction.options.getString('service', true);

  const options = searchServices(searchTerm);
  interaction.respond(options);
};

export const execute: CommandHandler = async (interaction) => {
  const code = interaction.options.getString('link_or_code', true);
  const service = interaction.options.getString('service', true).toLowerCase();
  logger.info(`[referral-new]: Adding new referral code for ${service} with code/link: ${code}`);

  const hasService = services.find((option) => option.toLowerCase() === service);
  if (!hasService) {
    logger.info(`[referral-new]: No service named ${service}.`);
    await interaction.reply(`No service named ${service}, ask the admin to add it`);
    return;
  }

  const expiredDate = interaction.options.getString('expiry_date', true);
  const [parseDateCase, parsedExpiryDate] = parseDate(expiredDate);

  if (parseDateCase === 'INVALID_DATE') {
    logger.info(`[referral-new]: expiry_date is invalid date format input:${expiredDate}`);
    await interaction.reply('expiry_date is invalid date try format DD/MM/YYYY');
    return;
  }
  if (parseDateCase === 'EXPIRED_DATE') {
    logger.info(`[referral-new]: expiry_date is already expired input:${expiredDate}`);
    await interaction.reply('expiry_date has already expired');
    return;
  }

  const db = getDbClient();

  try {
    const newReferralCode = await db.referralCode.create({
      data: {
        service,
        code,
        expiry_date: parsedExpiryDate,
      },
    });

    await interaction.reply(`new ${newReferralCode.code} in ${newReferralCode.service} expired on ${newReferralCode.expiry_date.toDateString()}`);
  } catch (error) {
    logger.error('[referral-new]: Failed to add referral code.', error);
    await interaction.reply(
      'Failed to add referral code. This might be an error with the database, or the referral code already exists. Please try again later.'
    );
  }
};
