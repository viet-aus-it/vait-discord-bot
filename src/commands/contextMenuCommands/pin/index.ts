import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
} from 'discord.js';
import { ContextMenuCommand } from '../../builder';

export const data = new ContextMenuCommandBuilder()
  .setName('Pin')
  .setType(ApplicationCommandType.Message);

export const pinMessage = async (
  interaction: ContextMenuCommandInteraction
) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  const message = interaction.targetMessage;

  if (message.pinned) {
    await interaction.reply('Message is already pinned. Skipping...');
    return;
  }
  await message.pin();
  await interaction.reply('Message is now pinned!');
};

const command: ContextMenuCommand = {
  data,
  execute: pinMessage,
};

export default command;
