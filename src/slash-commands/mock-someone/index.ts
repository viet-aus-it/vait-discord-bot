import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder, type TextChannel } from 'discord.js';
import { Result } from 'oxide.ts';

import { isBlank } from '../../utils/is-blank';
import { logger } from '../../utils/logger';
import { fetchLastMessageBeforeId } from '../../utils/message-fetcher';
import { getRandomBoolean } from '../../utils/random';
import { recordSpanError, setSpanAttributes } from '../../utils/tracer';
import type { SlashCommand } from '../builder';

const data = new SlashCommandBuilder()
  .setName('mock')
  .setDescription('Mock a sentence. SpOnGeBoB sTyLe.')
  .addStringOption((option) => option.setName('sentence').setDescription('The sentence to mock'))
  .setContexts(InteractionContextType.Guild);

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
    setSpanAttributes({ 'bot.mock.success': true });
    await interaction.reply(reply);
    return;
  }

  // If /mock is detected but content is blank, fetch the latest message in channel
  const fetchedMessage = await Result.safe(fetchLastMessageBeforeId(interaction.channel as TextChannel, interaction.id));

  // If it's still blank at this point, then exit
  if (fetchedMessage.isErr()) {
    recordSpanError(fetchedMessage.unwrapErr(), 'err-fetch-message-failed');
    setSpanAttributes({ 'bot.mock.success': false, 'bot.mock.reason': 'fetch-message' });
    logger.error('[mock]: Cannot fetch latest message', fetchedMessage.unwrapErr());
    await interaction.reply('Cannot fetch latest message. Please try again later.');
    return;
  }

  const { content } = fetchedMessage.unwrap();
  if (isBlank(content)) {
    setSpanAttributes({ 'bot.mock.success': false, 'bot.mock.reason': 'blank' });
    logger.warn('[mock]: Cannot fetch message to mock');
    await interaction.reply('Cannot fetch latest message. Please try again later.');
    return;
  }

  logger.info(`[mock]: Fetched message: ${content}`);
  const reply = generateMockText(content);
  setSpanAttributes({ 'bot.mock.success': true });
  await interaction.reply(reply);
};

const command: SlashCommand = {
  data,
  execute: mockSomeone,
};

export default command;
