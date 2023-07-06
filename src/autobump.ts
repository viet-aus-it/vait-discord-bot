import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { getUnixTime } from 'date-fns';
import { ThreadChannel } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDiscordClient } from './clients';
import { listAllThreads } from './commands/autobump-threads/util';

const env = dotenv.config();
dotenvExpand.expand(env);

const autobump = async () => {
  const settings = await Result.safe(listAllThreads());
  if (settings.isErr()) {
    console.error(
      `Cannot retrieve autobump thread lists. Timestamp: ${getUnixTime(
        new Date()
      )}`
    );
    process.exit(1);
  }

  const data = settings.unwrap();
  if (data.length === 0) {
    console.log(
      `No autobump threads settings found. Timestamp: ${getUnixTime(
        new Date()
      )}`
    );
    process.exit(0);
  }

  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  const jobs = await data.reduce(
    async (accumulator, { guildId, autobumpThreads }) => {
      const guild = client.guilds.cache.find(
        (g) => g.available && g.id === guildId
      );
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

  console.log(
    `Thread autobump complete. Jobs: ${jobs.length}. Timestamp: ${getUnixTime(
      new Date()
    )}`
  );
  process.exit(0);
};

autobump();
