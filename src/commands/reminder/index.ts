import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';
import remindOnDate from './remind-on-date';
import remindDuration from './remind-duration';
import update from './update';
import list from './list';

const data = new SlashCommandBuilder()
  .setName('reminder')
  .setDescription('Set up a reminder')
  .addSubcommand(remindOnDate.data)
  .addSubcommand(remindDuration.data)
  .addSubcommand(update.data)
  .addSubcommand(list.data);

const subcommands = [remindOnDate, remindDuration, update, list];

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
