import { eq } from 'drizzle-orm';

import { getDbClient } from '../../clients';
import { serverChannelsSettings } from '../../clients/database/schema/schema';

export const setReminderChannel = async (guildId: string, channelId: string) => {
  const db = getDbClient();
  const [settings] = await db
    .insert(serverChannelsSettings)
    .values({ guildId, reminderChannel: channelId })
    .onConflictDoUpdate({
      target: serverChannelsSettings.guildId,
      set: { reminderChannel: channelId },
    })
    .returning();

  return settings.reminderChannel as string;
};

export const getReminderChannel = async (guildId: string) => {
  const db = getDbClient();
  const rows = await db.select().from(serverChannelsSettings).where(eq(serverChannelsSettings.guildId, guildId)).limit(1);
  const serverSettings = rows[0];
  if (!serverSettings) {
    throw new Error('ServerChannelsSettings not found');
  }

  return serverSettings.reminderChannel;
};

export const setAocSettings = async (guildId: string, aocKey: string, aocLeaderboardId: string) => {
  const db = getDbClient();
  const rows = await db
    .insert(serverChannelsSettings)
    .values({ guildId, aocKey, aocLeaderboardId })
    .onConflictDoUpdate({
      target: serverChannelsSettings.guildId,
      set: { aocKey, aocLeaderboardId },
    })
    .returning({ guildId: serverChannelsSettings.guildId, aocLeaderboardId: serverChannelsSettings.aocLeaderboardId });

  return rows[0];
};

export const setHoneypotChannel = async (guildId: string, channelId: string) => {
  const db = getDbClient();
  const [settings] = await db
    .insert(serverChannelsSettings)
    .values({ guildId, honeypotChannel: channelId })
    .onConflictDoUpdate({
      target: serverChannelsSettings.guildId,
      set: { honeypotChannel: channelId },
    })
    .returning();

  return settings.honeypotChannel as string;
};
