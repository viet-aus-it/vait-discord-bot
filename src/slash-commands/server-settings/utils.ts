import { getDbClient } from '../../clients';
import { tracer } from '../../utils/tracer';

export const setReminderChannel = async (guildId: string, channelId: string) => {
  return tracer.startActiveSpan('db.serverSettings.setReminderChannel', async (span) => {
    try {
      const db = getDbClient();
      const settings = await db.serverChannelsSettings.upsert({
        where: {
          guildId,
        },
        update: {
          reminderChannel: channelId,
        },
        create: {
          guildId,
          reminderChannel: channelId,
        },
      });

      return settings.reminderChannel as string;
    } finally {
      span.end();
    }
  });
};

export const getReminderChannel = async (guildId: string) => {
  return tracer.startActiveSpan('db.serverSettings.getReminderChannel', async (span) => {
    try {
      const db = getDbClient();
      const serverSettings = await db.serverChannelsSettings.findFirstOrThrow({
        where: { guildId },
      });

      return serverSettings.reminderChannel;
    } finally {
      span.end();
    }
  });
};

export const setAocSettings = async (guildId: string, aocKey: string, aocLeaderboardId: string) => {
  return tracer.startActiveSpan('db.serverSettings.setAocSettings', async (span) => {
    try {
      const db = getDbClient();
      return db.serverChannelsSettings.upsert({
        where: { guildId },
        update: {
          aocKey,
          aocLeaderboardId,
        },
        create: {
          guildId,
          aocKey,
          aocLeaderboardId,
        },
        select: {
          guildId: true,
          aocLeaderboardId: true,
        },
      });
    } finally {
      span.end();
    }
  });
};

export const setHoneypotChannel = async (guildId: string, channelId: string) => {
  return tracer.startActiveSpan('db.serverSettings.setHoneypotChannel', async (span) => {
    try {
      const db = getDbClient();
      const settings = await db.serverChannelsSettings.upsert({
        where: {
          guildId,
        },
        update: {
          honeypotChannel: channelId,
        },
        create: {
          guildId,
          honeypotChannel: channelId,
        },
      });

      return settings.honeypotChannel as string;
    } finally {
      span.end();
    }
  });
};
