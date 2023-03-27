import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';
import remindOnDate from './remind-on-date';
import remindDuration from './remind-duration';
import update from './update';

const data = new SlashCommandBuilder()
  .setName('reminder')
  .setDescription('Set up a reminder')
  .addSubcommand(remindOnDate.data)
  .addSubcommand(remindDuration.data)
  .addSubcommand(update.data);

const subcommands = [remindOnDate, remindDuration, update];

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
