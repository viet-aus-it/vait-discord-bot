import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand, SlashCommandHandler } from '../builder';
import setAocSettings from './set-aoc-settings';
import setReminderChannel from './set-reminder-channel';

const data = new SlashCommandBuilder()
  .setName('server-settings')
  .setDescription('ADMIN ONLY COMMAND. Server Settings.')
  .addSubcommand(setReminderChannel.data)
  .addSubcommand(setAocSettings.data)
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

const subcommands = [setReminderChannel, setAocSettings];

const execute: SlashCommandHandler = async (interaction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find((cmd) => cmd.data.name === requestedSubcommand);
  return subcommand?.execute(interaction);
};

const command: SlashCommand = {
  data,
  execute,
};

export default command;
