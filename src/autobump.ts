import { getUnixTime } from 'date-fns';
import { ThreadChannel } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDiscordClient } from './clients';
import { listAllThreads } from './commands/autobump-threads/util';
import { getCurrentUnixTime } from './utils/dateUtils';
import { loadEnv } from './utils/loadEnv';
import { logger } from './utils/logger';

const autobump = async () => {
  loadEnv();
  logger.info(`AUTOBUMPING THREADS. TIMESTAMP: ${getUnixTime(new Date())}`);

  const settings = await Result.safe(listAllThreads());
  if (settings.isErr()) {
    logger.error(`Cannot retrieve autobump thread lists. Timestamp: ${getCurrentUnixTime()}`);
    process.exit(1);
  }

  const data = settings.unwrap();
  if (data.length === 0) {
    logger.info(`No autobump threads settings found. Timestamp: ${getCurrentUnixTime()}`);
    process.exit(0);
  }

  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  const jobs = await data.reduce(
    async (accumulator, { guildId, autobumpThreads }) => {
      const guild = client.guilds.cache.find((g) => g.available && g.id === guildId);
      if (!guild) {
        return accumulator;
      }

      const prev = await accumulator;
      const bumpPromises = autobumpThreads.map(async (id) => {
        const thread = (await guild.channels.fetch(id)) as ThreadChannel;
        return thread.setArchived(false);
      });
      const results = await Promise.all(bumpPromises);
      return [...prev, ...results];
    },
    Promise.resolve([] as unknown[])
  );

  logger.info(`Thread autobump complete. Jobs: ${jobs.length}. Timestamp: ${getCurrentUnixTime()}`);
  process.exit(0);
};

autobump();
