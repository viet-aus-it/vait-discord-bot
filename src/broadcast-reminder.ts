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
  logger.info('BROADCASTING REMINDERS');

  const queryTime = getCurrentUnixTime();
  const reminders = await Result.safe(getReminderByTime(getCurrentUnixTime()));
  if (reminders.isErr()) {
    logger.error(`[broadcast-reminder]: Cannot retrieve reminders. Query Time: ${queryTime}`);
    process.exit(1);
  }

  const remindersData = reminders.unwrap();
  if (remindersData.length === 0) {
    logger.info(`[broadcast-reminder]: No reminders to broadcast. Query Time: ${queryTime}`);
    process.exit(0);
  }

  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  const jobs = await remindersData.reduce(
    async (accumulator, reminder) => {
      const guild = client.guilds.cache.find((g) => g.available && g.id === reminder.guildId);
      if (!guild) {
        logger.info(`[broadcast-reminder]: Cannot find guild ${reminder.guildId} for reminder`);
        return accumulator;
      }

      const channelId = await Result.safe(getReminderChannel(guild.id));
      if (channelId.isErr()) {
        logger.info(`[broadcast-reminder]: Cannot find reminder channel settings for guild ${reminder.guildId}`);
        return accumulator;
      }

      const data = channelId.unwrap();
      if (!data) {
        logger.info(`[broadcast-reminder]: Cannot unwrap reminder channel for guild ${reminder.guildId}`);
        return accumulator;
      }
      const channel = client.channels.cache.get(data);
      if (!channel) {
        logger.info(`[broadcast-reminder]: Cannot find reminder channel id ${data} for guild ${reminder.guildId}`);
        return accumulator;
      }
      if (channel.type !== ChannelType.GuildText) {
        logger.info(`[broadcast-reminder]: Reminder channel id ${data} for guild ${reminder.guildId} is not a text channel`);
        return accumulator;
      }

      const prev = await accumulator;

      logger.info(`[broadcast-reminder]: Broadcasting reminder ${reminder.id} in guild ${guild.name} (${guild.id})`);
      const message = formatReminderMessage(reminder);
      const promise = channel.send(message);
      logger.info(`[broadcast-reminder]: Broadcasted reminder ${reminder.id} in guild ${guild.name} (${guild.id})`);

      return [...prev, promise];
    },
    Promise.resolve([] as unknown[])
  );

  await removeReminders(remindersData);

  logger.info(`[broadcast-reminder]: Reminders fan out complete. Jobs: ${jobs.length}`);
  process.exit(0);
};

broadcastReminder();
