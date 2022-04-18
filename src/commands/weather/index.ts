import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { fetchWeather } from './fetchWeather';
import { isBlank } from '../../utils';
import { Command } from '../command';

const DEFAULT_LOCATION = 'Brisbane';

const data = new SlashCommandBuilder()
  .setName('weather')
  .setDescription('Get current weather report at location')
  .addStringOption((option) =>
    option
      .setName('location')
      .setDescription(
        'The location you want a weather report on. Default: Brisbane'
      )
  );

export const weather = async (interaction: CommandInteraction) => {
  await interaction.deferReply();

  let location = interaction.options.getString('location');

  if (!location || isBlank(location)) {
    location = DEFAULT_LOCATION;
  }

  const weatherData = await fetchWeather(location);
  if (!weatherData) {
    await interaction.editReply('Error getting weather data for location.');
    return;
  }

  await interaction.editReply(`\`\`\`\n${weatherData}\n\`\`\``);
};

const command: Command = {
  data,
  execute: weather,
};

export default command;
