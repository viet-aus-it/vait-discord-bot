import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';
import { getRandomIntInclusive } from '../../utils';

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
  let numbers = '';
  let counter = 0;
  while (counter < 7) {
    const number = getRandomIntInclusive(1, 35);

    if (!numbers.includes(number.toString())) {
      numbers += `${number.toString().padStart(2, '0')} `;
      counter += 1;
      if (counter === 7) {
        return numbers;
      }
    }
  }
};

const getPowerballNumber = () => {
  return getRandomIntInclusive(1, 20).toString().padStart(2, '0');
};

export const powerball = async (interaction: ChatInputCommandInteraction) => {
  const gameCount = interaction.options.getInteger('count', true);
  let games = '';
  for (let i = 0; i < gameCount; i += 1) {
    games += `${getMainNumbers()} PB:${getPowerballNumber()}\n`;
  }
  interaction.reply(`\`\`\`${games}\`\`\``);
};

const command: Command = {
  data,
  execute: powerball,
};

export default command;
