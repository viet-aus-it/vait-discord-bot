import { ApplicationCommandType, ContextMenuCommandBuilder, type ContextMenuCommandInteraction } from 'discord.js';
import { logger } from '../../utils/logger';
import type { ContextMenuCommand } from '../builder';

export const data = new ContextMenuCommandBuilder().setName('Pin').setType(ApplicationCommandType.Message);

export const pinMessage = async (interaction: ContextMenuCommandInteraction) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  const message = interaction.targetMessage;
  logger.info(`[pin]: Pinning message ${message.id} in channel ${message.channelId}`);

  if (message.pinned) {
    logger.info(`[pin]: Message ${message.id} is already pinned.`);
    await interaction.reply('Message is already pinned. Skipping...');
    return;
  }

  await message.pin();
  logger.info(`[pin]: Successfully pinned message ${message.id} in channel ${message.channelId}`);
  await interaction.reply('Message is now pinned!');
};

const command: ContextMenuCommand = {
  data,
  execute: pinMessage,
};

export default command;
