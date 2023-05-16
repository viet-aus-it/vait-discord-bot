import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../command';
import { fetchQuote } from './fetchQuote';

const data = new SlashCommandBuilder()
  .setName('qotd')
  .setDescription('Get Quote of the Day');

// export const getQuoteOfTheDay = async ({ channel, author }: Message) => {
export const getQuoteOfTheDay = async (
  interaction: ChatInputCommandInteraction
) => {
  await interaction.deferReply();

  const quote = await fetchQuote();
  if (!quote) {
    await interaction.editReply('Error getting quotes');
    return;
  }

  const embed = new EmbedBuilder({
    color: 0x0072a8,
    title: quote.quote,
    description: `- ${quote.author} -`,
    author: {
      name: 'Quote of the day',
    },
    footer: {
      text: 'Inspirational quotes provided by ZenQuotes API',
    },
  });

  await interaction.editReply({ embeds: [embed] });
};

const command: Command = {
  data,
  execute: getQuoteOfTheDay,
};

export default command;
