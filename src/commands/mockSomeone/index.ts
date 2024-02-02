import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from 'discord.js';
import { Result } from 'oxide.ts';
import { fetchLastMessageBeforeId, getRandomBoolean, isBlank } from '../../utils';
import { logger } from '../../utils/logger';
import { Command } from '../builder';

const data = new SlashCommandBuilder()
  .setName('mock')
  .setDescription('Mock a sentence. SpOnGeBoB sTyLe.')
  .addStringOption((option) => option.setName('sentence').setDescription('The sentence to mock'));

const generateMockText = (message: string) =>
  message
    .trim()
    .toLowerCase()
    .split('')
    .reduce((outputText, character) => {
      const randomBoolean = getRandomBoolean();
      const spongeCharacter = randomBoolean ? character.toUpperCase() : character.toLowerCase();

      return `${outputText}${spongeCharacter}`;
    }, '');

export const mockSomeone = async (interaction: ChatInputCommandInteraction) => {
  const sentence = interaction.options.getString('sentence');

  if (sentence && !isBlank(sentence)) {
    logger.info(`[mock]: Received message: ${sentence}`);
    const reply = generateMockText(sentence);
    await interaction.reply(reply);
    return;
  }

  // If /mock is detected but content is blank, fetch the latest message in channel
  const fetchedMessage = await Result.safe(fetchLastMessageBeforeId(interaction.channel as TextChannel, interaction.id));

  // If it's still blank at this point, then exit
  if (fetchedMessage.isErr()) {
    logger.info('[mock]: Cannot fetch latest message.');
    await interaction.reply('Cannot fetch latest message. Please try again later.');
    return;
  }

  const { content } = fetchedMessage.unwrap();
  if (isBlank(content)) {
    logger.info('[mock]: Fetched message is blank.');
    await interaction.reply('Cannot fetch latest message. Please try again later.');
    return;
  }

  logger.info(`[mock]: Fetched message: ${content}`);
  const reply = generateMockText(content);
  await interaction.reply(reply);
};

const command: Command = {
  data,
  execute: mockSomeone,
};

export default command;
