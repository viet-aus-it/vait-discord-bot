import { addDays, getUnixTime } from 'date-fns';
import { type Guild, SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { AutocompleteHandler, CommandHandler } from '../builder';
import { parseDate } from './parseDate';
import { createReferralCode, findExistingReferralCode } from './referralUtils';
import { searchServices, services } from './services';

export const DEFAULT_EXPIRY_DAYS_FROM_NOW = 30;

export const data = new SlashCommandSubcommandBuilder()
  .setName('new')
  .setDescription('add new referral code/link for service')
  .addStringOption((option) =>
    option.setName('service').setDescription('service to refer(type more than 3 characters to see suggestion)').setRequired(true).setAutocomplete(true)
  )
  .addStringOption((option) => option.setName('link_or_code').setDescription('referral link or code').setRequired(true))
  .addStringOption((option) =>
    option
      .setName('expiry_date')
      .setDescription(`when the code/link expired (DD/MM//YYYY). By default, it's ${DEFAULT_EXPIRY_DAYS_FROM_NOW} days from now.`)
      .setRequired(false)
  );

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

  const expiryDateInput = interaction.options.getString('expiry_date', false);
  let expiryDate: Date;

  if (expiryDateInput) {
    const [parseDateCase, parsedExpiryDate] = parseDate(expiryDateInput);

    if (parseDateCase === 'INVALID_DATE') {
      logger.info(`[referral-new]: expiry_date is invalid date format input:${expiryDateInput}`);
      await interaction.reply('expiry_date is invalid date try format DD/MM/YYYY');
      return;
    }
    if (parseDateCase === 'EXPIRED_DATE') {
      logger.info(`[referral-new]: expiry_date is already expired input:${expiryDateInput}`);
      await interaction.reply('expiry_date has already expired');
      return;
    }

    expiryDate = parsedExpiryDate;
  } else {
    expiryDate = addDays(new Date(), 30);
  }

  const guildId = (interaction.guild as Guild).id;
  const userId = interaction.user.id;
  const nickname = interaction.user.displayName;

  const findOp = await Result.safe(findExistingReferralCode({ userId, guildId, service }));
  if (findOp.isErr()) {
    logger.error('[referral-new]: Error while searching for referral code', findOp.unwrapErr());
    await interaction.reply('This might be an error with the database. Please try again later.');
    return;
  }

  const existingReferralCode = findOp.unwrap();
  if (existingReferralCode) {
    logger.error(`[referral-new]: Referral code for ${service} by ${nickname} already exists.`);
    await interaction.reply(`You have already entered the referral code for ${service}.`);
    return;
  }

  const createOp = await Result.safe(createReferralCode({ userId, guildId, service, code, expiryDate }));
  if (createOp.isErr()) {
    logger.error('[referral-new]: Error while creating referral code', createOp.unwrapErr());
    await interaction.reply('Failed to add referral code. This might be an error with the database. Please try again later.');
    return;
  }

  const newReferralCode = createOp.unwrap();
  await interaction.reply(
    `${nickname} just added referral code ${newReferralCode.code} in ${newReferralCode.service} expired on <t:${getUnixTime(newReferralCode.expiry_date)}:D>`
  );
};
