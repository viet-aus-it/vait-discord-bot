import {
  TextChannel,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import {
  fetchLastMessageBeforeId,
  getRandomBoolean,
  isBlank,
} from '../../utils';
import { Command } from '../builder';

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
  const sentence = interaction.options.getString('sentence');

  if (sentence && !isBlank(sentence)) {
    const reply = generateMockText(sentence);
    await interaction.reply(reply);
    return;
  }

  // If /mock is detected but content is blank, fetch the latest message in channel
  const fetchedMessage = await fetchLastMessageBeforeId(
    interaction.channel as TextChannel,
    interaction.id
  );

  // If it's still blank at this point, then exit
  if (!fetchedMessage.success || isBlank(fetchedMessage.data.content)) {
    await interaction.reply(
      'Cannot fetch latest message. Please try again later.'
    );
    return;
  }

  const reply = generateMockText(fetchedMessage.data.content);
  await interaction.reply(reply);
};

const command: Command = {
  data,
  execute: mockSomeone,
};

export default command;
