import { ApplicationCommandType, ContextMenuCommandBuilder, type ContextMenuCommandInteraction, InteractionContextType } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { ContextMenuCommand } from '../builder';

export const data = new ContextMenuCommandBuilder().setName('Pin').setType(ApplicationCommandType.Message).setContexts(InteractionContextType.Guild);

export const pinMessage = async (interaction: ContextMenuCommandInteraction) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  const message = interaction.targetMessage;
  logger.info(`[pin]: Pinning message ${message.id} in channel ${message.channelId}`);

  if (message.pinned) {
    logger.info(`[pin]: Message ${message.id} is already pinned.`);
    await interaction.reply('Message is already pinned. Skipping...');
    return;
  }

  const op = await Result.safe(message.pin());
  if (op.isErr()) {
    logger.error(`[pin]: Cannot pin message ${message.id} in channel ${message.channelId}`, op.unwrapErr());
    await interaction.reply('ERROR: Cannot pin message. Please try again later.');
    return;
  }

  logger.info(`[pin]: Successfully pinned message ${message.id} in channel ${message.channelId}`);
  await interaction.reply('Message is now pinned!');
};

const command: ContextMenuCommand = {
  data,
  execute: pinMessage,
};

export default command;
