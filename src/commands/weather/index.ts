import { Message, TextChannel } from 'discord.js';
import { fetchWeather } from './fetchWeather';
import { isBlank } from '../../utils';

const DEFAULT_LOCATION = 'Brisbane';

export const weather = async ({ content, channel, author }: Message) => {
  // Return if sender is bot
  if (author.bot) return;

  const firstSpaceChar = content.trimEnd().indexOf(' ');

  let chatContent =
    firstSpaceChar !== -1 ? content.slice(firstSpaceChar).trimStart() : '';

  if (isBlank(chatContent)) {
    chatContent = DEFAULT_LOCATION;
  }

  const weatherData = await fetchWeather(chatContent);
  if (!weatherData) return;

  const textChannel = channel as TextChannel;
  textChannel.send(`\`\`\`\n${weatherData}\n\`\`\``);
};
