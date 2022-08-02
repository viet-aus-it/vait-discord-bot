import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { MessageType } from 'discord-api-types/v10';
import { fetchLastMessageBeforeId, fetchMessageById } from '../../utils';
import { Command } from '../command.js';

export const data = new SlashCommandBuilder()
  .setName('pin')
  .setDescription(
    'Pin a message with an id. If not provided, pin the previous message.'
  )
  .addStringOption((option) =>
    option.setName('message_id').setDescription('Message ID')
  );

const USER_MESSAGES_TYPE = Object.freeze([
  MessageType.Default,
  MessageType.ChatInputCommand,
  MessageType.Reply,
]);

const processPinMessage = async (
  interaction: ChatInputCommandInteraction,
  message?: Message
) => {
  if (!message) {
    await interaction.reply(
      'Cannot retrieve message to pin. Please try again.'
    );
    return;
  }

  if (!USER_MESSAGES_TYPE.includes(message.type)) {
    await interaction.reply('Cannot pin a system message. Skipping...');
    return;
  }

  if (message.pinned) {
    await interaction.reply('Message is already pinned. Skipping...');
    return;
  }

  await message.pin();
  await interaction.reply('Message is now pinned!');
};

export const pinMessage = async (interaction: ChatInputCommandInteraction) => {
  const messageId = interaction.options.getString('messageId');
  const textChannel = interaction.channel as TextChannel;

  if (messageId) {
    const fetchedMessage = await fetchMessageById(textChannel, messageId!);
    await processPinMessage(interaction, fetchedMessage);
    return;
  }

  const fetchedMessage = await fetchLastMessageBeforeId(
    textChannel,
    interaction.id
  );
  await processPinMessage(interaction, fetchedMessage);
};

const command: Command = {
  data,
  execute: pinMessage,
};

export default command;
