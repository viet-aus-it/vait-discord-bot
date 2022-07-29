import {
  TextChannel,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import {
  fetchLastMessageBeforeId,
  getRandomBoolean,
  isBlank,
} from '../../utils/index.js';
import { Command } from '../command.js';

const data = new SlashCommandBuilder()
  .setName('mock')
  .setDescription('Mock a sentence. SpOnGeBoB sTyLe.')
  .addStringOption((option) =>
    option.setName('sentence').setDescription('The sentence to mock')
  );

const generateMockText = (message: string) =>
  message
    .trim()
    .toLowerCase()
    .split('')
    .reduce((outputText, character) => {
      const randomBoolean = getRandomBoolean();
      const spongeCharacter = randomBoolean
        ? character.toUpperCase()
        : character.toLowerCase();

      return `${outputText}${spongeCharacter}`;
    }, '');

export const mockSomeone = async (interaction: ChatInputCommandInteraction) => {
  let sentence = interaction.options.getString('sentence');

  if (sentence && !isBlank(sentence)) {
    const mockText = generateMockText(sentence);
    await interaction.reply(mockText);
    return;
  }

  // If /mock is detected but content is blank, fetch the latest message in channel
  sentence = await fetchLastMessageBeforeId(
    interaction.channel as TextChannel,
    interaction.id
  );

  // If it's still blank at this point, then exit
  if (!sentence || isBlank(sentence)) {
    await interaction.reply(
      'Cannot fetch latest message. Please try again later.'
    );
    return;
  }

  const mockText = generateMockText(sentence);
  await interaction.reply(mockText);
};

const command: Command = {
  data,
  execute: mockSomeone,
};

export default command;
