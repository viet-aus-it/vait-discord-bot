import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { isBlank } from '../../utils/isBlank';
import { logger } from '../../utils/logger';
import type { Command } from '../builder';
import { fetchWeather } from './fetchWeather';

export const DEFAULT_LOCATION = 'Brisbane';

const data = new SlashCommandBuilder()
  .setName('weather')
  .setDescription('Get current weather report at location')
  .addStringOption((option) => option.setName('location').setDescription('The location you want a weather report on. Default: Brisbane'));

export const weather = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  let location = interaction.options.getString('location');

  if (!location || isBlank(location)) {
    location = DEFAULT_LOCATION;
  }
  logger.info(`[weather]: ${interaction.user.tag} is getting the weather for location ${location}`);

  const weatherData = await Result.safe(fetchWeather(location));
  if (weatherData.isErr()) {
    logger.info('[weather]: Error getting weather data', weatherData.unwrapErr());
    await interaction.editReply('Error getting weather data for location.');
    return;
  }

  logger.info('[weather]: Weather data received');
  await interaction.editReply(`\`\`\`\n${weatherData.unwrap()}\n\`\`\``);
};

const command: Command = {
  data,
  execute: weather,
};

export default command;
