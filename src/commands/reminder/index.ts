import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../builder';
import remindOnDate from './remind-on-date';
import remindDuration from './remind-duration';
import update from './update';
import list from './list';
import removeReminder from './remove';

const data = new SlashCommandBuilder()
  .setName('reminder')
  .setDescription('Set up a reminder')
  .addSubcommand(remindOnDate.data)
  .addSubcommand(remindDuration.data)
  .addSubcommand(update.data)
  .addSubcommand(list.data)
  .addSubcommand(removeReminder.data);

const subcommands = [
  remindOnDate,
  remindDuration,
  update,
  list,
  removeReminder,
];

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
