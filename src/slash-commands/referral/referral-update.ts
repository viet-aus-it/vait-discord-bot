import { addDays, getUnixTime } from 'date-fns';
import { type Guild, SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommandHandler } from '../builder';
import { parseDate } from './parse-date';
import { DEFAULT_EXPIRY_DAYS_FROM_NOW } from './referral-new';
import { getReferralCodeById, updateReferralCode } from './utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('update')
  .setDescription('Update an existing referral code/link')
  .addStringOption((option) => option.setName('id').setDescription('ID of the referral to update (use /referral list to see IDs)').setRequired(true))
  .addStringOption((option) => option.setName('link_or_code').setDescription('new referral link or code').setRequired(false))
  .addStringOption((option) =>
    option
      .setName('expiry_date')
      .setDescription(`new expiry date (DD/MM/YYYY). Leave empty to extend by ${DEFAULT_EXPIRY_DAYS_FROM_NOW} days from now.`)
      .setRequired(false)
  );

export const execute: SlashCommandHandler = async (interaction) => {
  const id = interaction.options.getString('id', true);
  const newCode = interaction.options.getString('link_or_code', false);
  const expiryDateInput = interaction.options.getString('expiry_date', false);
  const guildId = (interaction.guild as Guild).id;
  const userId = interaction.user.id;
  const nickname = interaction.user.displayName;

  logger.info(`[referral-update]: User ${nickname} updating referral ID: ${id}`);

  // Check if the referral exists and belongs to the user
  const findOp = await Result.safe(getReferralCodeById({ id, userId, guildId }));
  if (findOp.isErr()) {
    logger.error('[referral-update]: Error while searching for referral code', findOp.unwrapErr());
    await interaction.reply('This might be an error with the database. Please try again later.');
    return;
  }

  const existingReferral = findOp.unwrap();
  if (!existingReferral) {
    logger.info(`[referral-update]: Referral code with ID ${id} not found for user ${nickname}.`);
    await interaction.reply(`No referral found with ID \`${id}\` in your referrals. Use \`/referral list\` to see your referrals.`);
    return;
  }

  // Validate expiry date if provided
  let newExpiryDate: Date | undefined;
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

    newExpiryDate = parsedExpiryDate;
  }

  // If no specific updates provided, extend expiry by default days
  if (!newCode && !expiryDateInput) {
    newExpiryDate = addDays(new Date(), DEFAULT_EXPIRY_DAYS_FROM_NOW);
  }

  // Ensure at least one field is being updated
  if (!newCode && !newExpiryDate) {
    await interaction.reply('Please specify either a new code/link or expiry date to update.');
    return;
  }

  const updateOp = await Result.safe(
    updateReferralCode({
      id,
      userId,
      guildId,
      code: newCode || undefined,
      expiryDate: newExpiryDate,
    })
  );

  if (updateOp.isErr()) {
    logger.error('[referral-update]: Error while updating referral code', updateOp.unwrapErr());
    await interaction.reply('Failed to update referral code. This might be an error with the database. Please try again later.');
    return;
  }

  const updateResult = updateOp.unwrap();
  if (updateResult.count === 0) {
    logger.error(`[referral-update]: No rows updated for referral ID ${id}.`);
    await interaction.reply('Failed to update referral code. Please check the ID and try again.');
    return;
  }

  // Build success message
  let successMessage = `Successfully updated referral for **${existingReferral.service}**:`;

  if (newCode) {
    successMessage += `\n• New code: \`${newCode}\``;
  }

  if (newExpiryDate) {
    const expiryTimestamp = getUnixTime(newExpiryDate);
    successMessage += `\n• New expiry: <t:${expiryTimestamp}:D>`;
  }

  await interaction.reply(successMessage);
};
