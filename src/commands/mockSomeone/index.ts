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
import { Command } from '../command';

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

const sendMockText = async (
  content: string,
  interaction: ChatInputCommandInteraction
) => {
  const reply = generateMockText(content);

  try {
    await interaction.reply(reply);
  } catch (error) {
    console.error('CANNOT SEND MESSAGE', error);
  }
};

export const mockSomeone = async (interaction: ChatInputCommandInteraction) => {
  let sentence = interaction.options.getString('sentence');

  if (sentence && !isBlank(sentence)) {
    await sendMockText(sentence, interaction);
    return;
  }

  // If /mock is detected but content is blank, fetch the latest message in channel
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

  sentence = fetchedMessage.content;
  await sendMockText(sentence, interaction);
};

const command: Command = {
  data,
  execute: mockSomeone,
};

export default command;
