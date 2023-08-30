import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { isBlank } from '../../utils';
import { Command } from '../builder';
import { randomInsultGenerator } from './insultGenerator';

const data = new SlashCommandBuilder()
  .setName('insult')
  .setDescription('Generate an insult. If a target is provided, it will insult them directly.')
  .addStringOption((option) => option.setName('target').setDescription('The name to insult'));

export const insult = async (interaction: ChatInputCommandInteraction) => {
  const target = interaction.options.getString('target');

  const insultText = randomInsultGenerator();

  if (target && !isBlank(target)) {
    const replyText = `${target}, ${insultText.toLowerCase()}`;
    await interaction.reply(replyText);
    return;
  }

  await interaction.reply(insultText);
};

const command: Command = {
  data,
  execute: insult,
};

export default command;
