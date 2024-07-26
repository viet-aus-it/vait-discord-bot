import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { ThreadChannel } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDiscordClient } from '../src/clients';
import { listAllThreads } from '../src/slash-commands/autobump-threads/utils';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { setupTracer } from './tracing';

const autobump = async () => {
  loadEnv();
  setupTracer();
  const tracer = trace.getTracer('discord-bot');
  await tracer.startActiveSpan('autobump', async (span) => {
    logger.info('AUTOBUMPING THREADS');
    span.setStatus({
      code: SpanStatusCode.UNSET,
      message: 'Auto bumping threads',
    });
    span.setAttributes({
      'app.entrypoint': 'autobump',
    });

    const settings = await Result.safe(listAllThreads());
    if (settings.isErr()) {
      logger.error('[autobump]: Cannot retrieve autobump thread lists');
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Cannot retrieve autobump thread lists',
      });
      span.setAttributes({
        'app.autobump.error': settings.unwrapErr().toString(),
      });
      span.end();

      process.exit(1);
    }

    const data = settings.unwrap();
    if (data.length === 0) {
      logger.info('[autobump]: No autobump threads settings found');
      span.setStatus({
        code: SpanStatusCode.OK,
        message: 'No autobump threads settings found',
      });
      span.end();

      process.exit(0);
    }

    const token = process.env.TOKEN;
    const client = await getDiscordClient({ token });

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
          return thread.setArchived(false);
        });
        const results = await Promise.all(bumpPromises);
        logger.info(`[autobump]: Bumped ${results.length} threads in guild ${guild.name} (${guild.id})`);
        return [...prev, ...results];
      },
      Promise.resolve([] as unknown[])
    );

    logger.info(`[autobump]: Thread autobump complete. Jobs: ${jobs.length}`);
    span.setStatus({
      code: SpanStatusCode.OK,
      message: 'Thread autobump complete.',
    });
    span.setAttributes({
      'app.autobump.threads': jobs.length,
    });
    span.end();
  });

  process.exit(0);
};

autobump();
