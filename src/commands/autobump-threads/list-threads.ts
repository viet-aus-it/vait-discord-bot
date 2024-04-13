import type { ServerChannelsSettings } from '@prisma/client';
import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { CommandHandler, Subcommand } from '../builder';
import { listThreadsByGuild } from './utils';

const data = new SlashCommandSubcommandBuilder().setName('list').setDescription('Show list of autobump threads');

const buildThreadList = (threadIds: ServerChannelsSettings['autobumpThreads']) => {
  const startText = 'Here is the threads to be autobumped in this server:\n';
  return threadIds.reduce((body, id) => {
    return `${body}- <#${id}>\n`;
  }, startText);
};

export const listAutobumpThreadsCommand: CommandHandler = async (interaction) => {
  const guildId = interaction.guildId!;
  const threads = await Result.safe(listThreadsByGuild(guildId));
  logger.info(`[list-autobump-threads]: Listing autobump threads for guild ${guildId}`);

  if (threads.isErr()) {
    logger.error(`[list-autobump-threads]: Cannot get list of threads from the database for guild ${guildId}`);
    await interaction.reply("ERROR: Cannot get list of threads from the database, maybe the server threads aren't setup yet?");
    return;
  }

  const data = threads.unwrap();
  if (data.length === 0) {
    logger.error(`[list-autobump-threads]: No threads have been setup for autobumping in guild ${guildId}`);
    await interaction.reply('ERROR: No threads have been setup for autobumping in this server');
    return;
  }

  logger.info(`[list-autobump-threads]: Found autobump threads for guild ${guildId}`);
  const body = buildThreadList(data);
  await interaction.reply(body);
};

const subcommand: Subcommand = {
  data,
  execute: listAutobumpThreadsCommand,
};

export default subcommand;
