import { type GuildMember, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand, SlashCommandHandler } from '../builder';
import addThread from './add-thread';
import listThreads from './list-threads';
import removeThread from './remove-thread';

const data = new SlashCommandBuilder()
  .setName('autobump-threads')
  .setDescription('ADMIN ONLY COMMAND. Server Settings.')
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addSubcommand(listThreads.data)
  .addSubcommand(addThread.data)
  .addSubcommand(removeThread.data);

const subcommands = [listThreads, addThread, removeThread];

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
