import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { isBlank } from '../../utils/index.js';
import { Command } from '../command.js';
import { randomInsultGenerator } from './insultGenerator.js';

const data = new SlashCommandBuilder()
  .setName('insult')
  .setDescription(
    'Generate an insult. If a target is provided, it will insult them directly.'
  )
  .addStringOption((option) =>
    option.setName('target').setDescription('The name to insult')
  );

const sendInsult = async (
  insult: string,
  interaction: ChatInputCommandInteraction
) => {
  try {
    await interaction.reply(insult);
  } catch (error) {
    console.error('CANNOT SEND MESSAGE', error);
  }
};

export const insult = async (interaction: ChatInputCommandInteraction) => {
  const target = interaction.options.getString('target');

  const insultText = randomInsultGenerator();

  if (target && !isBlank(target)) {
    const replyText = `${target}, ${insultText.toLowerCase()}`;
    await sendInsult(replyText, interaction);
    return;
  }

  await sendInsult(insultText, interaction);
};

const command: Command = {
  data,
  execute: insult,
};

export default command;
