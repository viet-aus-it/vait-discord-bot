import { Message } from 'discord.js';

interface Quote {
  q: string;
  a: string;
  h: string;
}

const fetch = require('node-fetch');

const getQuoteOfTheDay = async ({ channel, author, content }: Message) => {
  try {
    if (author.bot) return; // return if bot sends the command
    const mockPrefix = '-qotd';
    if (content.toLowerCase() !== mockPrefix) return;
    const response = await fetch(
      'https://zenquotes.io/api/random/6a874c704a11dea9305fe58e145d51c218f9f143'
    ); // download quotes from this site
    const body = await (<Quote[]>response.json());
    if (body.length === 0) return; // return if no quote is downloaded
    const quote = body[0];
    channel.send({
      embed: {
        color: 0x0072a8,
        title: 'Quote of the day',
        description: quote.q,
        footer: {
          text: quote.a,
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export default getQuoteOfTheDay;
