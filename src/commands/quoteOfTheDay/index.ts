import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { Command } from '../builder';
import { fetchQuote } from './fetchQuote';

const data = new SlashCommandBuilder().setName('qotd').setDescription('Get Quote of the Day');

export const getQuoteOfTheDay = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const quote = await Result.safe(fetchQuote());
  if (quote.isErr()) {
    await interaction.editReply('Error getting quotes');
    return;
  }

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

  await interaction.editReply({ embeds: [embed] });
};

const command: Command = {
  data,
  execute: getQuoteOfTheDay,
};

export default command;
