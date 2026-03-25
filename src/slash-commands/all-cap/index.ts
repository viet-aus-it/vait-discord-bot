import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder, type TextChannel } from 'discord.js';
import { Result } from 'oxide.ts';
import { isBlank } from '../../utils/is-blank';
import { logger } from '../../utils/logger';
import { fetchLastMessageBeforeId } from '../../utils/message-fetcher';
import { tracer } from '../../utils/tracer';
import type { SlashCommand } from '../builder';

const data = new SlashCommandBuilder()
  .setName('allcap')
  .setDescription('Make your text L O O K S  L I K E  T H I S')
  .addStringOption((option) => option.setName('sentence').setDescription('Sentence to All cap'))
  .setContexts(InteractionContextType.Guild);

const generateAllCapText = (message: string) =>
  message
    .trim()
    .toUpperCase()
    .split('')
    .reduce((outputText, character) => {
      return `${outputText + character} `;
    }, '');

export const allCapExpandText = async (interaction: ChatInputCommandInteraction) => {
  return tracer.startActiveSpan('command.allCap', async (span) => {
    try {
      const content = interaction.options.getString('sentence');

      if (content && !isBlank(content)) {
        logger.info(`[allcap]: Received message: ${content}`);
        const reply = generateAllCapText(content);
        await interaction.reply(reply);
        return;
      }

      // If /allcap is detected but content is blank, fetch the latest message in channel
      const fetchedMessage = await Result.safe(fetchLastMessageBeforeId(interaction.channel as TextChannel, interaction.id));

      // If it's still blank at this point, then exit
      if (fetchedMessage.isErr() || isBlank(fetchedMessage.unwrap().content)) {
        logger.error('[allcap]: Cannot fetch message to allcap', { error: fetchedMessage.unwrapErr() });
        await interaction.reply('Cannot fetch latest message. Please try again later.');
        return;
      }

      logger.info(`[allcap]: Fetched message: ${fetchedMessage.unwrap().content}`);
      const reply = generateAllCapText(fetchedMessage.unwrap().content);
      await interaction.reply(reply);
    } finally {
      span.end();
    }
  });
};

const command: SlashCommand = {
  data,
  execute: allCapExpandText,
};

export default command;
