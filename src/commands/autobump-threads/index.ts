import { type GuildMember, SlashCommandBuilder } from 'discord.js';
import { isAdmin, isModerator } from '../../utils/isSentFromAdmin';
import addThread from '../autobump-threads/add-thread';
import listThreads from '../autobump-threads/list-threads';
import removeThread from '../autobump-threads/remove-thread';
import type { Command, CommandHandler } from '../builder';

const data = new SlashCommandBuilder()
  .setName('autobump-threads')
  .setDescription('ADMIN ONLY COMMAND. Server Settings.')
  .addSubcommand(listThreads.data)
  .addSubcommand(addThread.data)
  .addSubcommand(removeThread.data);

const subcommands = [listThreads, addThread, removeThread];

const execute: CommandHandler = async (interaction) => {
  const member = interaction.member as GuildMember;
  if (!isAdmin(member) && !isModerator(member)) {
    await interaction.reply("You don't have enough permission to run this command.");
    return;
  }

  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find((cmd) => cmd.data.name === requestedSubcommand);
  return subcommand?.execute(interaction);
};

const command: Command = {
  data,
  execute,
};

export default command;
