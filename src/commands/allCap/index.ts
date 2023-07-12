import {
  ChatInputCommandInteraction,
  TextChannel,
  SlashCommandBuilder,
} from 'discord.js';
import { Result } from 'oxide.ts';
import { fetchLastMessageBeforeId, isBlank } from '../../utils';
import { Command } from '../builder';

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

export const allCapExpandText = async (
  interaction: ChatInputCommandInteraction
) => {
  const content = interaction.options.getString('sentence');

  if (content && !isBlank(content)) {
    const reply = generateAllCapText(content);
    await interaction.reply(reply);
    return;
  }

  // If /allcap is detected but content is blank, fetch the latest message in channel
  const fetchedMessage = await Result.safe(
    fetchLastMessageBeforeId(interaction.channel as TextChannel, interaction.id)
  );

  // If it's still blank at this point, then exit
  if (fetchedMessage.isErr() || isBlank(fetchedMessage.unwrap().content)) {
    await interaction.reply(
      'Cannot fetch latest message. Please try again later.'
    );
    return;
  }

  const reply = generateAllCapText(fetchedMessage.unwrap().content);
  await interaction.reply(reply);
};

const command: Command = {
  data,
  execute: allCapExpandText,
};

export default command;
