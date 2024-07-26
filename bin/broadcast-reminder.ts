import { SpanStatusCode, trace } from '@opentelemetry/api';
import { ChannelType } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDiscordClient } from '../src/clients';
import { formatReminderMessage, getReminderByTime, removeReminders } from '../src/slash-commands/reminder/utils';
import { getReminderChannel } from '../src/slash-commands/server-settings/utils';
import { getCurrentUnixTime } from '../src/utils/date';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { setupTracer } from './tracing';

const broadcastReminder = async () => {
  loadEnv();
  setupTracer();
  const tracer = trace.getTracer('discord-bot');
  await tracer.startActiveSpan('broadcast-reminder', async (span) => {
    logger.info('BROADCASTING REMINDERS');
    span.setStatus({
      code: SpanStatusCode.UNSET,
      message: 'Broadcasting reminders',
    });
    span.setAttributes({
      'app.entrypoint': 'broadcast-reminder',
    });

    const queryTime = getCurrentUnixTime();
    const reminders = await Result.safe(getReminderByTime(getCurrentUnixTime()));
    if (reminders.isErr()) {
      logger.error(`[broadcast-reminder]: Cannot retrieve reminders. Query Time: ${queryTime}`);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Cannot retrieve reminders.',
      });
      span.setAttributes({
        'app.reminders.query_time': queryTime,
        'app.reminders.error': reminders.unwrapErr().toString(),
      });
      span.recordException('Cannot retrieve reminders.', queryTime);
      span.end();

      throw new Error('Cannot retrieve reminders.');
    }

    const remindersData = reminders.unwrap();
    if (remindersData.length === 0) {
      logger.info(`[broadcast-reminder]: No reminders to broadcast. Query Time: ${queryTime}`);
      span.setStatus({
        code: SpanStatusCode.OK,
        message: 'No reminders to broadcast.',
      });
      span.setAttributes({
        'app.reminders.query_time': queryTime,
      });
      span.end();

      return;
    }

    const token = process.env.TOKEN;
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
    span.setStatus({
      code: SpanStatusCode.OK,
      message: 'Reminders fan out complete.',
    });
    span.setAttributes({
      'app.reminders.query_time': queryTime,
      'app.reminders.broadcasted': jobs.length,
    });
    span.end();
  });

  process.exit(0);
};

broadcastReminder();
