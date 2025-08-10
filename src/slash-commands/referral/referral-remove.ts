import { type Guild, SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommandHandler } from '../builder';
import { deleteReferralCode, getReferralCodeById } from './utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('remove')
  .setDescription('Remove one of your referral codes/links')
  .addStringOption((option) => option.setName('id').setDescription('ID of the referral to remove (use /referral list to see IDs)').setRequired(true));

export const execute: SlashCommandHandler = async (interaction) => {
  const id = interaction.options.getString('id', true);
  const guildId = (interaction.guild as Guild).id;
  const userId = interaction.user.id;
  const nickname = interaction.user.displayName;

  logger.info(`[referral-remove]: User ${nickname} removing referral ID: ${id}`);

  // Check if the referral exists and belongs to the user
  const findOp = await Result.safe(getReferralCodeById({ id, userId, guildId }));
  if (findOp.isErr()) {
    logger.error('[referral-remove]: Error while searching for referral code', findOp.unwrapErr());
    await interaction.reply('This might be an error with the database. Please try again later.');
    return;
  }

  const existingReferral = findOp.unwrap();
  if (!existingReferral) {
    logger.info(`[referral-remove]: Referral code with ID ${id} not found for user ${nickname}.`);
    await interaction.reply(`No referral found with ID \`${id}\` in your referrals. Use \`/referral list\` to see your referrals.`);
    return;
  }

  const deleteOp = await Result.safe(deleteReferralCode({ id, userId, guildId }));
  if (deleteOp.isErr()) {
    logger.error('[referral-remove]: Error while deleting referral code', deleteOp.unwrapErr());
    await interaction.reply('Failed to remove referral code. This might be an error with the database. Please try again later.');
    return;
  }

  const deleteResult = deleteOp.unwrap();
  if (deleteResult.count === 0) {
    logger.error(`[referral-remove]: No rows deleted for referral ID ${id}.`);
    await interaction.reply('Failed to remove referral code. Please check the ID and try again.');
    return;
  }

  await interaction.reply(`Successfully removed referral code for **${existingReferral.service}**: \`${existingReferral.code}\``);
};
