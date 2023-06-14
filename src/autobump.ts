import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { ThreadChannel } from 'discord.js';
import { getDiscordClient } from './clients';
import { listAllThreads } from './commands/serverSettings/autobump-threads/util';

const env = dotenv.config();
dotenvExpand.expand(env);

const autobump = async () => {
  const settings = await listAllThreads();
  if (!settings.success) {
    console.error('Cannot retrieve autobump thread lists.');
    process.exit(1);
    return;
  }

  if (settings.data.length === 0) {
    console.log('No autobump threads settings found.');
    process.exit(0);
    return;
  }

  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  const jobs = await settings.data.reduce(
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

  console.log(`Thread autobump complete. Jobs: ${jobs.length}`);
  process.exit(0);
  return undefined;
};

autobump();
