import { getDbClient } from '../../clients';

export const setReminderChannel = async (guildId: string, channelId: string) => {
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
};

export const getReminderChannel = async (guildId: string) => {
  const db = getDbClient();
  const serverSettings = await db.serverChannelsSettings.findFirstOrThrow({
    where: { guildId },
  });

  return serverSettings.reminderChannel;
};

export const setAocSettings = async (guildId: string, aocKey: string, aocLeaderboardId: string) => {
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
};

export const setHoneypotChannel = async (guildId: string, channelId: string) => {
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
};

export const getHoneypotChannel = async (guildId: string) => {
  const db = getDbClient();
  const serverSettings = await db.serverChannelsSettings.findFirst({
    where: { guildId },
  });

  return serverSettings?.honeypotChannel ?? null;
};
