import type { Span } from '@opentelemetry/api';
import { ChannelType } from 'discord.js';
import { Result } from 'oxide.ts';

import { getDiscordClient } from '../src/clients';
import { formatReminderMessage, getReminderByTime, removeReminders } from '../src/slash-commands/reminder/utils';
import { getReminderChannel } from '../src/slash-commands/server-settings/utils';
import { getCurrentUnixTime } from '../src/utils/date';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { recordSpanError, tracer } from '../src/utils/tracer';

const handleBroadcast = async (span: Span, token: string) => {
  const queryTime = getCurrentUnixTime();
  span.setAttribute('bot.reminder.query_time', queryTime);

  const reminders = await Result.safe(getReminderByTime(getCurrentUnixTime()));
  if (reminders.isErr()) {
    recordSpanError(reminders.unwrapErr(), 'err-broadcast-reminder-query-failed');
    logger.error(`[broadcast-reminder]: Cannot retrieve reminders. Query Time: ${queryTime}`, reminders.unwrapErr());
    return 1;
  }

  const remindersData = reminders.unwrap();
  span.setAttribute('bot.reminder.count', remindersData.length);

  if (remindersData.length === 0) {
    logger.info(`[broadcast-reminder]: No reminders to broadcast. Query Time: ${queryTime}`);
    return 0;
  }

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
  return 0;
};

const broadcastReminder = async () => {
  const env = loadEnv();
  logger.info('BROADCASTING REMINDERS');

  const result = await tracer.startActiveSpan('broadcastReminder', async (span) => {
    const op = await Result.safe(handleBroadcast(span, env.TOKEN));
    span.end();
    return op;
  });

  const exitCode = result.isOk() ? result.unwrap() : 1;
  process.exit(exitCode);
};

broadcastReminder();
