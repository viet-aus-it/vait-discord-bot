import { type ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommand } from '../builder';
import { fetchQuote } from './fetch-quote';

const data = new SlashCommandBuilder().setName('qotd').setDescription('Get Quote of the Day').setContexts(InteractionContextType.Guild);

export const getQuoteOfTheDay = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  logger.info(`[quote-of-the-day]: ${interaction.user.tag} is getting a quote of the day`);
  const quote = await Result.safe(fetchQuote());
  if (quote.isErr()) {
    logger.info('[quote-of-the-day]: Error getting quotes', quote.unwrapErr());
    await interaction.editReply('Error getting quotes');
    return;
  }

  logger.info('[quote-of-the-day]: Quote received');
  const data = quote.unwrap();
  const embed = new EmbedBuilder({
    color: 0x0072a8,
    title: data.quote,
    description: `- ${data.author} -`,
    author: {
      name: 'Quote of the day',
    },
    footer: {
      text: 'Inspirational quotes provided by ZenQuotes API',
    },
  });

  logger.info('[quote-of-the-day]: Replying with quote');
  await interaction.editReply({ embeds: [embed] });
};

const command: SlashCommand = {
  data,
  execute: getQuoteOfTheDay,
};

export default command;
