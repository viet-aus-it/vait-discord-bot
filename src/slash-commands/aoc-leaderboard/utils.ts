import { eq, type InferSelectModel } from 'drizzle-orm';

import { getDbClient } from '../../clients';
import { aocLeaderboard, serverChannelsSettings } from '../../clients/database/schema/schema';
import { logger } from '../../utils/logger';
import { fetchLeaderboard } from './client';
import type { AocLeaderboard } from './schema';

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export const getAocSettings = async (guildId: string) => {
  const db = getDbClient();
  const rows = await db
    .select({
      guildId: serverChannelsSettings.guildId,
      aocKey: serverChannelsSettings.aocKey,
      aocLeaderboardId: serverChannelsSettings.aocLeaderboardId,
    })
    .from(serverChannelsSettings)
    .where(eq(serverChannelsSettings.guildId, guildId))
    .limit(1);

  return rows[0];
};

export const saveLeaderboard = async (guildId: string, aocLeaderboardResponse: AocLeaderboard) => {
  const db = getDbClient();
  const [row] = await db
    .insert(aocLeaderboard)
    .values({ guildId, result: aocLeaderboardResponse as unknown as JsonValue })
    .onConflictDoUpdate({
      target: aocLeaderboard.guildId,
      set: { updatedAt: new Date(), result: aocLeaderboardResponse as unknown as JsonValue },
    })
    .returning({ result: aocLeaderboard.result, updatedAt: aocLeaderboard.updatedAt });

  return row;
};

type AocSettings = Pick<InferSelectModel<typeof serverChannelsSettings>, 'aocKey' | 'aocLeaderboardId' | 'guildId'>;
export const fetchAndSaveLeaderboard = async (year: number, { aocKey, aocLeaderboardId, guildId }: AocSettings) => {
  if (!aocKey || !aocLeaderboardId) {
    const errorMessage = 'Cannot fetch leaderboard without key and leaderboard id';
    logger.error(`[fetch-and-save-leaderboard]: ${errorMessage}!`);
    throw new Error(errorMessage);
  }
  const aocLeaderboardResponse = await fetchLeaderboard(aocKey, aocLeaderboardId, year);

  const savedResult = await saveLeaderboard(guildId, aocLeaderboardResponse);

  return savedResult;
};

export const getSavedLeaderboard = async (guildId: string) => {
  const db = getDbClient();
  const rows = await db
    .select({ result: aocLeaderboard.result, updatedAt: aocLeaderboard.updatedAt })
    .from(aocLeaderboard)
    .where(eq(aocLeaderboard.guildId, guildId))
    .limit(1);

  return rows[0];
};

export const deleteLeaderboard = async (guildId: string) => {
  const db = getDbClient();
  const rows = await db.delete(aocLeaderboard).where(eq(aocLeaderboard.guildId, guildId)).returning();

  return rows[0];
};
