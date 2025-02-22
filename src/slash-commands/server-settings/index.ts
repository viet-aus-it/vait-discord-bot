import { type GuildMember, SlashCommandBuilder } from 'discord.js';
import { isAdmin, isModerator } from '../../utils/permission';
import type { SlashCommand, SlashCommandHandler } from '../builder';
import setAocSettings from './set-aoc-settings';
import setReminderChannel from './set-reminder-channel';

const data = new SlashCommandBuilder()
  .setName('server-settings')
  .setDescription('ADMIN ONLY COMMAND. Server Settings.')
  .addSubcommand(setReminderChannel.data)
  .addSubcommand(setAocSettings.data);

const subcommands = [setReminderChannel, setAocSettings];

const execute: SlashCommandHandler = async (interaction) => {
  const member = interaction.member as GuildMember;
  if (!isAdmin(member) && !isModerator(member)) {
    await interaction.reply("You don't have enough permission to run this command.");
    return;
  }

  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find((cmd) => cmd.data.name === requestedSubcommand);
  return subcommand?.execute(interaction);
};

const command: SlashCommand = {
  data,
  execute,
};

export default command;
