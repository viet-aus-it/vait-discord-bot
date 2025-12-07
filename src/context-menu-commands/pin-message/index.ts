import { ApplicationCommandType, ContextMenuCommandBuilder, type ContextMenuCommandInteraction, InteractionContextType } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { ContextMenuCommand } from '../builder';

export const data = new ContextMenuCommandBuilder().setName('Pin/Unpin').setType(ApplicationCommandType.Message).setContexts(InteractionContextType.Guild);

export const pinMessageCommand = async (interaction: ContextMenuCommandInteraction) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  const message = interaction.targetMessage;

  if (message.pinned) {
    logger.info(`[pin]: Message ${message.id} is already pinned. Unpinning...`);
    const op = await Result.safe(message.unpin());
    if (op.isErr()) {
      console.log(op.unwrapErr());
      logger.error(`[pin]: Cannot unpin message ${message.id} in channel ${message.channelId}`, op.unwrapErr());
      await interaction.reply('ERROR: Cannot unpin message. Please try again later.');
      return;
    }
    logger.info(`[pin]: Successfully unpinned message ${message.id} in channel ${message.channelId}`);
    await interaction.reply('Message is now unpinned!');
    return;
  }

  logger.info(`[pin]: Message ${message.id} is not pinned. Pinning...`);
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
  execute: pinMessageCommand,
};

export default command;
