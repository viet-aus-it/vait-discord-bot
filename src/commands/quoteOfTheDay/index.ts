import { Message, MessageEmbed } from 'discord.js';
import { fetchQuote } from './fetchQuote';

export const getQuoteOfTheDay = async ({ channel, author }: Message) => {
  if (author.bot) return; // return if bot sends the command
  const quote = await fetchQuote();
  if (!quote) return;

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

  channel.send({ embed });
};
