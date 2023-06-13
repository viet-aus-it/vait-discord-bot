import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../builder';
import {
  getRandomIntInclusive,
  getUniqueRandomIntInclusive,
} from '../../utils';

const data = new SlashCommandBuilder()
  .setName('powerball')
  .setDescription('Get some random Powerball numbers')
  .addIntegerOption((option) =>
    option
      .setName('count')
      .setDescription('How many games do you need?')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(10)
  );

const getMainNumbers = () => {
  return Array(7)
    .fill(0)
    .reduce((array: number[]) => {
      const number = getUniqueRandomIntInclusive(array, 1, 35);
      array.push(number);
      return array;
    }, [])
    .map((number) => `${number.toString().padStart(2, '0')}`)
    .join(' ');
};

const getPowerballNumber = () => {
  return getRandomIntInclusive(1, 20).toString().padStart(2, '0');
};

export const getPowerBallGame = (count: number): string => {
  const games = Array(count)
    .fill(undefined)
    .map(() => `${getMainNumbers()} PB:${getPowerballNumber()}`)
    .join('\n');
  return `\`\`\`${games}\`\`\``;
};

export const powerball = async (interaction: ChatInputCommandInteraction) => {
  const gameCount = interaction.options.getInteger('count', true);
  const games = getPowerBallGame(gameCount);
  interaction.reply(games);
};

const command: Command = {
  data,
  execute: powerball,
};

export default command;
