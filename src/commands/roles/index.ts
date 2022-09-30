import { SlashCommandBuilder } from 'discord.js';
import { AutocompleteHandler, Command, CommandHandler } from '../command';

import * as roleAdd from './assign_role';
import * as roleRemove from './remove_role';

const subcommands = [roleAdd, roleRemove];

// roles assign role
// roles remove role
const getData = () => {
  return new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Set your user role')
    .addSubcommand(roleAdd.data)
    .addSubcommand(roleRemove.data);
};

const autocomplete: AutocompleteHandler = async (interaction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find(
    ({ data: { name } }) => name === requestedSubcommand
  );
  return subcommand?.autocomplete?.(interaction);
};

const execute: CommandHandler = async (interaction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find(
    ({ data: { name } }) => name === requestedSubcommand
  );
  return subcommand?.execute?.(interaction);
};

const command: Command = {
  data: getData(),
  autocomplete,
  execute,
};

export default command;
