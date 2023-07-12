import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
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

const env = dotenv.config();
dotenvExpand.expand(env);

const broadcastReminder = async () => {
  const currentTime = getUnixTime(new Date());
  const reminders = await Result.safe(getReminderByTime(currentTime));
  if (reminders.isErr()) {
    console.error('Cannot retrieve reminders.');
    process.exit(1);
  }

  const remindersData = reminders.unwrap();
  if (remindersData.length === 0) {
    console.log('No reminders to broadcast.');
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

  console.log(`Reminders fan out complete. Jobs: ${jobs.length}`);
  process.exit(0);
};

broadcastReminder();
