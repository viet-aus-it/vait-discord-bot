import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../command';
import { fetchQuote } from './fetchQuote';

const data = new SlashCommandBuilder()
  .setName('qotd')
  .setDescription('Get Quote of the Day');

// export const getQuoteOfTheDay = async ({ channel, author }: Message) => {
export const getQuoteOfTheDay = async (interaction: CommandInteraction) => {
  await interaction.deferReply();

  const quote = await fetchQuote();
  if (!quote) {
    await interaction.editReply('Error getting quotes');
    return;
  }

  const embed = new MessageEmbed({
    color: '#0072a8',
    title: quote.quote,
    description: `- ${quote.author} -`,
    author: {
      name: `Quote of the day`,
    },
    footer: {
      text: `Inspirational quotes provided by ZenQuotes API`,
    },
  });

  await interaction.editReply({ embeds: [embed] });
};

const command: Command = {
  data,
  execute: getQuoteOfTheDay,
};

export default command;
