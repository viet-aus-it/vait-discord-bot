import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommandHandler } from '../builder';
import { deleteReferralCode } from './utils';

export { autocomplete } from './referral-autocomplete';

export const data = new SlashCommandSubcommandBuilder()
  .setName('delete')
  .setDescription('Delete a referral code')
  .addStringOption((option) => option.setName('service').setDescription('Service name to delete referral code for. This must be provided.').setRequired(true));

export const execute: SlashCommandHandler = async (interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId!;
  const service = interaction.options.getString('service', true);

  logger.info(`[referral-delete]: Deleting referral for service ${service} for user ${userId}`);

  const op = await Result.safe(
    deleteReferralCode({
      service,
      userId,
      guildId,
    })
  );

  if (op.isErr()) {
    logger.error('[referral-delete]: Error while deleting referral code', op.unwrapErr());
    await interaction.reply('Failed to delete referral code. Please try again later.');
    return;
  }

  const result = op.unwrap();
  if (result.count === 0) {
    logger.info(`[referral-delete]: No referral found for service ${service} for user ${userId}`);
    await interaction.reply(`Cannot find referral code for service "${service}". Please check the service name and try again.`);
    return;
  }

  logger.info(`[referral-delete]: Successfully deleted referral for service ${service}`);
  await interaction.reply(`Referral code for service "${service}" has been deleted.`);
};
