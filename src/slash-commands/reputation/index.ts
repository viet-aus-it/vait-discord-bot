import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../builder';
import checkRep from './check-reputation';
import giveRep from './give-reputation';
import leaderboard from './leaderboard';
import setRep from './set-reputation';
import takeRep from './take-reputation';

const data = new SlashCommandBuilder()
  .setName('rep')
  .setDescription('Reputation module')
  .addSubcommand(checkRep.data)
  .addSubcommand(giveRep.data)
  .addSubcommand(takeRep.data)
  .addSubcommand(setRep.data)
  .addSubcommand(leaderboard.data);

const subcommands = [checkRep, giveRep, takeRep, setRep, leaderboard];

const execute = async (interaction: ChatInputCommandInteraction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);

  const subcommand = subcommands.find((cmd) => cmd.data.name === requestedSubcommand);
  return subcommand?.execute(interaction);
};

const command: SlashCommand = {
  data,
  execute,
};

export default command;
