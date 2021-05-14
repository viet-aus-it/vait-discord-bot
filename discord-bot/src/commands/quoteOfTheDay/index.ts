import { Message } from 'discord.js';
import fetchQuote from './fetchQuote';

const getQuoteOfTheDay = async ({ channel, author }: Message) => {
  if (author.bot) return; // return if bot sends the command
  const quote = await fetchQuote();
  if (!quote) return;

  channel.send({
    embed: {
      color: 0x0072a8,
      title: quote.quote,
      description: `- ${quote.author} -`,
      author: {
        name: `Quote of the day`,
      },
      footer: {
        text: `Inspirational quotes provided by ZenQuotes API`,
      },
    },
  });
};

export default getQuoteOfTheDay;
