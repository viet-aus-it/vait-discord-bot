import { eq, sql } from 'drizzle-orm';

import { getDbClient } from '../../clients/db';
import { serverChannelsSettings } from '../../clients/db/schema/schema';

export const addAutobumpThread = async (guildId: string, threadId: string) => {
  const db = getDbClient();
  const [settings] = await db
    .insert(serverChannelsSettings)
    .values({ guildId, autobumpThreads: [threadId] })
    .onConflictDoUpdate({
      target: serverChannelsSettings.guildId,
      set: {
        autobumpThreads: sql`array_append(${serverChannelsSettings.autobumpThreads}, ${threadId})`,
      },
    })
    .returning();

  return settings.autobumpThreads;
};

export const removeAutobumpThread = async (guildId: string, threadId: string) => {
  const db = getDbClient();
  const settings = await db.query.serverChannelsSettings.findFirst({ where: { guildId } });
  if (!settings) {
    throw new Error('ServerChannelsSettings not found');
  }

  const [updated] = await db
    .update(serverChannelsSettings)
    .set({ autobumpThreads: (settings.autobumpThreads ?? []).filter((t) => t !== threadId) })
    .where(eq(serverChannelsSettings.guildId, guildId))
    .returning();

  return updated.autobumpThreads ?? [];
};

export const listThreadsByGuild = async (guildId: string) => {
  const db = getDbClient();
  const settings = await db.query.serverChannelsSettings.findFirst({ where: { guildId } });
  if (!settings) {
    throw new Error('ServerChannelsSettings not found');
  }

  return settings.autobumpThreads ?? [];
};

export const listAllThreads = async () => {
  const db = getDbClient();

  const result = await db.query.serverChannelsSettings.findMany({
    columns: { guildId: true, autobumpThreads: true },
  });

  return result.map((record) => ({
    guildId: record.guildId,
    autobumpThreads: record.autobumpThreads ?? [],
  }));
};
