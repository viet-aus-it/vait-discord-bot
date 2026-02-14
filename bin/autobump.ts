import type { ThreadChannel } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDiscordClient } from '../src/clients';
import { listAllThreads } from '../src/slash-commands/autobump-threads/utils';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';

const DEFAULT_AUTOBUMP_MESSAGE = '👋 Thread auto-bumped to keep it active!';

const bumpThread = async (thread: ThreadChannel, clientId?: string) => {
  try {
    const messages = await thread.messages.fetch({ limit: 100 });

    if (clientId) {
      const botMessages = messages.filter((m) => m.author.bot && m.author.id === clientId);

      if (botMessages.size === 0) {
        logger.warn(`[autobump]: No existing bot message found in thread ${thread.id}`);
      } else {
        await Promise.all(botMessages.map((m) => m.delete()));
      }
    }

    await thread.setArchived(false);
    await thread.send(DEFAULT_AUTOBUMP_MESSAGE);
  } catch (error) {
    logger.error(`[autobump]: Failed to bump thread ${thread.id}`, error);
  }
};

const autobump = async () => {
  loadEnv();
  logger.info('AUTOBUMPING THREADS');

  const settings = await Result.safe(listAllThreads());
  if (settings.isErr()) {
    logger.error('[autobump]: Cannot retrieve autobump thread lists');
    process.exit(1);
  }

  const data = settings.unwrap();
  if (data.length === 0) {
    logger.info('[autobump]: No autobump threads settings found');
    process.exit(0);
  }

  const token = process.env.TOKEN;
  const client = await getDiscordClient({ token });
  const clientId = client.user?.id;

  const jobs = await data.reduce(
    async (accumulator, { guildId, autobumpThreads }) => {
      const guild = client.guilds.cache.find((g) => g.available && g.id === guildId);
      if (!guild) {
        logger.info(`[autobump]: Cannot find guild ${guildId} for autobump`);
        return accumulator;
      }

      const prev = await accumulator;
      logger.info(`[autobump]: Bumping ${autobumpThreads.length} threads in guild ${guild.name} (${guild.id})`);
      const bumpPromises = autobumpThreads.map(async (id) => {
        const thread = (await guild.channels.fetch(id)) as ThreadChannel;
        await bumpThread(thread, clientId);
        return { threadId: id, success: true };
      });
      const results = await Promise.all(bumpPromises);
      logger.info(`[autobump]: Bumped ${results.filter((r) => r.success).length} threads in guild ${guild.name} (${guild.id})`);
      return [...prev, ...results];
    },
    Promise.resolve([] as unknown[])
  );

  logger.info(`[autobump]: Thread autobump complete. Jobs: ${jobs.length}`);
  process.exit(0);
};

autobump();
