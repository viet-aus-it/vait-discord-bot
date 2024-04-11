import { type GuildMember, SlashCommandBuilder } from 'discord.js';
import { isAdmin, isModerator } from '../../utils/permission';
import type { SlashCommand, SlashCommandHandler } from '../builder';
import addThread from './add-thread';
import listThreads from './list-threads';
import removeThread from './remove-thread';

const data = new SlashCommandBuilder()
  .setName('autobump-threads')
  .setDescription('ADMIN ONLY COMMAND. Server Settings.')
  .addSubcommand(listThreads.data)
  .addSubcommand(addThread.data)
  .addSubcommand(removeThread.data);

const subcommands = [listThreads, addThread, removeThread];

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
