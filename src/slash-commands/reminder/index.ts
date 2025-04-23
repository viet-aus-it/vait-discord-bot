import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../builder';
import list from './list';
import remindDuration from './remind-duration';
import remindOnDate from './remind-on-date';
import removeReminder from './remove';
import update from './update';

const data = new SlashCommandBuilder()
  .setName('reminder')
  .setDescription('Set up a reminder')
  .setContexts(InteractionContextType.Guild)
  .addSubcommand(remindOnDate.data)
  .addSubcommand(remindDuration.data)
  .addSubcommand(update.data)
  .addSubcommand(list.data)
  .addSubcommand(removeReminder.data);

const subcommands = [remindOnDate, remindDuration, update, list, removeReminder];

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
