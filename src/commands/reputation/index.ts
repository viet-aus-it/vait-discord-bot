import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../command.js';
import checkRep from './checkReputation.js';
import giveRep from './giveReputation.js';
import takeRep from './takeReputation.js';
import setRep from './setReputation.js';

const data = new SlashCommandBuilder()
  .setName('rep')
  .setDescription('Reputation module')
  .addSubcommand(checkRep.data)
  .addSubcommand(giveRep.data)
  .addSubcommand(takeRep.data)
  .addSubcommand(setRep.data);

const subcommands = [checkRep, giveRep, takeRep, setRep];

const execute = async (interaction: ChatInputCommandInteraction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);

  const subcommand = subcommands.find(
    (cmd) => cmd.data.name === requestedSubcommand
  );
  return subcommand?.execute(interaction);
};

const command: Command = {
  data,
  execute,
};

export default command;

export { thankUserInMessage } from './giveReputation.js';
