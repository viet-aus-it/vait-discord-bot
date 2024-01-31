import { getUnixTime } from 'date-fns';
import { ChannelType } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDiscordClient } from './clients';
import { formatReminderMessage, getReminderByTime, removeReminders } from './commands/reminder/reminder-utils';
import { getReminderChannel } from './commands/serverSettings/server-utils';
import { getCurrentUnixTime } from './utils/dateUtils';
import { loadEnv } from './utils/loadEnv';
import { logger } from './utils/logger';

const broadcastReminder = async () => {
  loadEnv();
  logger.info(`BROADCASTING REMINDERS. TIMESTAMP: ${getUnixTime(new Date())}`);

  const queryTime = getCurrentUnixTime();
  const reminders = await Result.safe(getReminderByTime(getCurrentUnixTime()));
  if (reminders.isErr()) {
    logger.error(`Cannot retrieve reminders. Timestamp: ${getCurrentUnixTime()}. Query Time: ${queryTime}`);
    process.exit(1);
  }

  const remindersData = reminders.unwrap();
  if (remindersData.length === 0) {
    logger.info(`No reminders to broadcast. Timestamp: ${getCurrentUnixTime()}. Query Time: ${queryTime}`);
    process.exit(0);
  }

  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  const jobs = await remindersData.reduce(
    async (accumulator, reminder) => {
      const guild = client.guilds.cache.find((g) => g.available && g.id === reminder.guildId);
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
    },
    Promise.resolve([] as unknown[])
  );

  await removeReminders(remindersData);

  logger.info(`Reminders fan out complete. Jobs: ${jobs.length}. Timestamp: ${getCurrentUnixTime()}`);
  process.exit(0);
};

broadcastReminder();
