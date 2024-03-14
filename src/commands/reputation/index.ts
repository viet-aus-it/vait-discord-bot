import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../builder';
import checkRep from './checkReputation';
import giveRep from './giveReputation';
import leaderboard from './leaderboard';
import setRep from './setReputation';
import takeRep from './takeReputation';

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

const command: Command = {
  data,
  execute,
};

export default command;

export { thankUserInMessage } from './giveReputation';
