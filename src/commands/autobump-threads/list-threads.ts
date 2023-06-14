import { SlashCommandSubcommandBuilder } from 'discord.js';
import { ServerChannelsSettings } from '@prisma/client';
import { Subcommand, CommandHandler } from '../builder';
import { listThreadsByGuild } from './util';

const data = new SlashCommandSubcommandBuilder()
  .setName('list')
  .setDescription('Show list of autobump threads');

const buildThreadList = (
  threadIds: ServerChannelsSettings['autobumpThreads']
) => {
  const startText = 'Here is the threads to be autobumped in this server:\n';
  return threadIds.reduce((body, id) => {
    return `${body}- <#${id}>\n`;
  }, startText);
};

export const listAutobumpThreadsCommand: CommandHandler = async (
  interaction
) => {
  const guildId = interaction.guildId!;
  const threads = await listThreadsByGuild(guildId);

  if (!threads.success) {
    await interaction.reply(
      "ERROR: Cannot get list of threads from the database, maybe the server threads aren't setup yet?"
    );
    return;
  }

  if (threads.data.length === 0) {
    await interaction.reply(
      'No threads have been setup for autobumping in this server'
    );
    return;
  }

  const body = buildThreadList(threads.data);
  await interaction.reply(body);
};

const subcommand: Subcommand = {
  data,
  execute: listAutobumpThreadsCommand,
};

export default subcommand;
