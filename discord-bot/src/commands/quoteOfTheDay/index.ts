import { Message } from 'discord.js';
import fetch from 'node-fetch';

interface Quote {
  q: string;
  a: string;
  h: string;
}

const getQuoteOfTheDay = async ({ channel, author }: Message) => {
  if (author.bot) return; // return if bot sends the command

  const response = await fetch(
    'https://zenquotes.io/api/random/6a874c704a11dea9305fe58e145d51c218f9f143'
  ); // download quotes from this site
  const body: Quote[] = await response.json();
  if (body.length === 0) return; // return if no quote is downloaded
  const quote = body[0];
  
  channel.send({
    embed: {
      color: 0x0072a8,
      author: {
        name: 'Inspirational quotes provided by ZenQuotes API',
      },
      title: 'Quote of the day',
      description: quote.q,
      footer: {
        text: quote.a,
      },
    },
  });
};

export default getQuoteOfTheDay;
