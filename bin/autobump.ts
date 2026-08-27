import type { Span } from '@opentelemetry/api';
import type { ThreadChannel } from 'discord.js';
import { Result } from 'oxide.ts';

import { getDiscordClient } from '../src/clients';
import { listAllThreads } from '../src/slash-commands/autobump-threads/utils';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { recordSpanError, tracer } from '../src/utils/tracer';

const DEFAULT_AUTOBUMP_MESSAGE = '👋 Thread auto-bumped to keep it active!';

const performBump = async (thread: ThreadChannel, clientId?: string) => {
  const messages = await thread.messages.fetch({ limit: 100 });

  await thread.setArchived(false);

  if (clientId) {
    const botMessages = messages.filter((m) => m.author.bot && m.author.id === clientId);

    if (botMessages.size === 0) {
      logger.warn(`[autobump]: No existing bot message found in thread ${thread.id}`);
    } else {
      await Promise.all(botMessages.map((m) => m.delete()));
    }
  }

  await thread.send(DEFAULT_AUTOBUMP_MESSAGE);
};

const bumpThread = async (thread: ThreadChannel, clientId?: string) => {
  const op = await Result.safe(performBump(thread, clientId));
  if (op.isErr()) {
    logger.error(`[autobump]: Failed to bump thread ${thread.id}`, op.unwrapErr());
  }
};

const handleAutobump = async (span: Span, token: string) => {
  const settings = await Result.safe(listAllThreads());
  if (settings.isErr()) {
    recordSpanError(settings.unwrapErr(), 'err-autobump-list-failed');
    logger.error('[autobump]: Cannot retrieve autobump thread lists', settings.unwrapErr());
    return 1;
  }

  const data = settings.unwrap();
  if (data.length === 0) {
    logger.info('[autobump]: No autobump threads settings found');
    return 0;
  }

  span.setAttribute(
    'bot.autobump.thread_count',
    data.reduce((sum, d) => sum + d.autobumpThreads.length, 0)
  );

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
  return 0;
};

const autobump = async () => {
  const env = loadEnv();
  logger.info('AUTOBUMPING THREADS');

  const result = await tracer.startActiveSpan('autobump', async (span) => {
    const op = await Result.safe(handleAutobump(span, env.TOKEN));
    span.end();
    return op;
  });

  const exitCode = result.isOk() ? result.unwrap() : 1;
  process.exit(exitCode);
};

autobump();
