import { ChannelType } from 'discord.js';
import { getUnixTime } from 'date-fns';
import { Result } from 'oxide.ts';
import { getDiscordClient } from './clients';
import {
  formatReminderMessage,
  getReminderByTime,
  removeReminders,
} from './commands/reminder/reminder-utils';
import { getReminderChannel } from './commands/serverSettings/server-utils';
import { loadEnv } from './utils/loadEnv';
import { logger } from './utils/logger';

const broadcastReminder = async () => {
  loadEnv();
  const currentTime = getUnixTime(new Date());
  const reminders = await Result.safe(getReminderByTime(currentTime));
  if (reminders.isErr()) {
    logger.error('Cannot retrieve reminders.');
    process.exit(1);
  }

  const remindersData = reminders.unwrap();
  if (remindersData.length === 0) {
    logger.info('No reminders to broadcast.');
    process.exit(0);
  }

  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  const jobs = await remindersData.reduce(async (accumulator, reminder) => {
    const guild = client.guilds.cache.find(
      (g) => g.available && g.id === reminder.guildId
    );
    if (!guild) {
      return accumulator;
    }

    const channelId = await Result.safe(getReminderChannel(guild.id));
    if (channelId.isErr()) {
      return accumulator;
    }

    const data = channelId.unwrap();
    if (!data) {
      return accumulator;
    }
    const channel = client.channels.cache.get(data);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return accumulator;
    }

    const prev = await accumulator;
    const message = formatReminderMessage(reminder);
    const promise = channel.send(message);

    return [...prev, promise];
  }, Promise.resolve([] as unknown[]));

  await removeReminders(remindersData);

  logger.info(`Reminders fan out complete. Jobs: ${jobs.length}`);
  process.exit(0);
};

broadcastReminder();
