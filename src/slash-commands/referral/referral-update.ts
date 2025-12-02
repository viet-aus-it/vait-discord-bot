import { getUnixTime } from 'date-fns';
import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommandHandler } from '../builder';
import { parseDate } from './parse-date';
import { updateReferralCode } from './utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('update')
  .setDescription('Update an existing referral code')
  .addStringOption((option) => option.setName('service').setDescription('Service name to update referral code for. This must be provided.').setRequired(true))
  .addStringOption((option) => option.setName('link_or_code').setDescription('New referral link or code').setRequired(false))
  .addStringOption((option) => option.setName('expiry_date').setDescription('New expiry date (DD/MM/YYYY)').setRequired(false));

export const execute: SlashCommandHandler = async (interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId!;
  const service = interaction.options.getString('service', true);
  const code = interaction.options.getString('link_or_code');
  const expiryDateInput = interaction.options.getString('expiry_date');

  logger.info(`[referral-update]: Updating referral for service ${service} for user ${userId}`);

  if (!code && !expiryDateInput) {
    logger.info('[referral-update]: No fields to update');
    await interaction.reply('Nothing to update. Please provide either a new link/code or expiry date.');
    return;
  }

  let expiryDate: Date | undefined;
  if (expiryDateInput) {
    const [parseDateCase, parsedExpiryDate] = parseDate(expiryDateInput);

    if (parseDateCase === 'INVALID_DATE') {
      logger.info(`[referral-update]: expiry_date is invalid date format input:${expiryDateInput}`);
      await interaction.reply('expiry_date is an invalid date. Please use the format DD/MM/YYYY.');
      return;
    }
    if (parseDateCase === 'EXPIRED_DATE') {
      logger.info(`[referral-update]: expiry_date is already expired input:${expiryDateInput}`);
      await interaction.reply('expiry_date has already expired');
      return;
    }

    expiryDate = parsedExpiryDate;
  }

  const op = await Result.safe(
    updateReferralCode({
      service,
      userId,
      guildId,
      code: code ?? undefined,
      expiryDate,
    })
  );

  if (op.isErr()) {
    logger.error('[referral-update]: Error while updating referral code', op.unwrapErr());
    await interaction.reply('Failed to update referral code. Please try again later.');
    return;
  }

  const result = op.unwrap();
  if (result.count === 0) {
    logger.info(`[referral-update]: No referral found for service ${service} for user ${userId}`);
    await interaction.reply(`Cannot find referral code for service "${service}". Please check the service name and try again.`);
    return;
  }

  logger.info(`[referral-update]: Successfully updated referral for service ${service}`);
  const updates = [];
  if (code) updates.push(`code: ${code}`);
  if (expiryDate) updates.push(`expires: <t:${getUnixTime(expiryDate)}:D>`);
  await interaction.reply(`Referral code for service "${service}" has been updated with ${updates.join(', ')}.`);
};
