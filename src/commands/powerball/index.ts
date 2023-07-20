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

const MIN_POWER_BALL_NUMBER = 1;
const MAX_POWER_BALL_NUMBER = 35;
const MAX_POWER_HIT_NUMBER = 20;

const padNumber = (num: number) => num.toString(10).padStart(2, '0');

const getMainNumbers = () => {
  return Array(7)
    .fill(0)
    .reduce((accumulator, _value, index) => {
      const number = getUniqueRandomIntInclusive(
        accumulator,
        MIN_POWER_BALL_NUMBER,
        MAX_POWER_BALL_NUMBER
      );
      return `${accumulator}${index > 0 ? ' ' : ''}${padNumber(number)}`;
    }, '');
};

const getPowerballNumber = () => {
  const number = getRandomIntInclusive(
    MIN_POWER_BALL_NUMBER,
    MAX_POWER_HIT_NUMBER
  );
  return padNumber(number);
};

const getPowerBallGame = (count: number) => {
  const games = Array(count)
    .fill(undefined)
    .reduce<string>((accumulator, _value, index) => {
      const line = `${getMainNumbers()} PB:${getPowerballNumber()}`;
      return `${accumulator}${index > 0 ? '\n' : ''}${line}`;
    }, '');

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
