import {
  ChatInputCommandInteraction,
  TextChannel,
  SlashCommandBuilder,
} from 'discord.js';
import { fetchLastMessageBeforeId, isBlank } from '../../utils';
import { Command } from '../command';

const data = new SlashCommandBuilder()
  .setName('allcap')
  .setDescription('Make your text L O O K S  L I K E  T H I S')
  .addStringOption((option) =>
    option.setName('sentence').setDescription('Sentence to All cap')
  );

const generateAllCapText = (message: string) =>
  message
    .trim()
    .toUpperCase()
    .split('')
    .reduce((outputText, character) => {
      return `${outputText + character} `;
    }, '');

const sendAllCapText = async (
  content: string,
  interaction: ChatInputCommandInteraction
) => {
  const reply = generateAllCapText(content);

  try {
    await interaction.reply(reply);
  } catch (error) {
    console.error('CANNOT SEND MESSAGE', error);
  }
};

export const allCapExpandText = async (
  interaction: ChatInputCommandInteraction
) => {
  let content = interaction.options.getString('sentence');

  if (content && !isBlank(content)) {
    await sendAllCapText(content, interaction);
    return;
  }

  // If /allcap is detected but content is blank, fetch the latest message in channel
  const fetchedMessage = await fetchLastMessageBeforeId(
    interaction.channel as TextChannel,
    interaction.id
  );

  // If it's still blank at this point, then exit
  if (!fetchedMessage || isBlank(fetchedMessage.content)) {
    await interaction.reply(
      'Cannot fetch latest message. Please try again later.'
    );
    return;
  }

  content = fetchedMessage.content;
  await sendAllCapText(content, interaction);
};

const command: Command = {
  data,
  execute: allCapExpandText,
};

export default command;
