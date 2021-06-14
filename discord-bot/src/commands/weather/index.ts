import { Message, TextChannel } from 'discord.js';
import fetchWeather from './fetchWeather';

const isBlank = (content: string) => content.trim() === '';

const weather = async ({ content, channel, author }: Message) => {
  // Return if sender is bot
  if (author.bot) return;

  const textChannel = channel as TextChannel;

  const firstSpaceChar = content.trimEnd().indexOf(' ');

  let chatContent =
    firstSpaceChar !== -1 ? content.slice(firstSpaceChar).trimStart() : '';

  if (isBlank(chatContent)) {
    chatContent = 'Brisbane';
  }

  const weatherData = await fetchWeather(chatContent);
  if (!weatherData) return;

  textChannel.send(`\`\`\`\n${weatherData.weather}\n\`\`\``);
};

export default weather;
