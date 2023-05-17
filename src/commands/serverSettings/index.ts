import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { Command, CommandHandler } from '../builder';
import { isAdmin, isModerator } from '../../utils';
import setReminderChannel from './set-reminder-channel';
import listThreads from './autobump-threads/list-threads';

const data = new SlashCommandBuilder()
  .setName('server-settings')
  .setDescription('ADMIN ONLY COMMAND. Server Settings.')
  .addSubcommand(setReminderChannel.data)
  .addSubcommand(listThreads.data);

const subcommands = [setReminderChannel, listThreads];

const execute: CommandHandler = async (interaction) => {
  const member = interaction.member as GuildMember;
  if (!isAdmin(member) && !isModerator(member)) {
    await interaction.reply(
      "You don't have enough permission to run this command."
    );
    return;
  }

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
