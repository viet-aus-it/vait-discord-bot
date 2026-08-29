import { eq } from 'drizzle-orm';

import { getDbClient } from '../../clients/db';
import { aocLeaderboard, ServerChannelsSettingsSelect } from '../../clients/db/schema/schema';
import { logger } from '../../utils/logger';
import { setSpanAttributes } from '../../utils/tracer';
import { fetchLeaderboard } from './client';
import type { AocLeaderboard } from './schema';

export const getAocSettings = async (guildId: string) => {
  const db = getDbClient();
  return db.query.serverChannelsSettings.findFirst({
    where: { guildId },
    columns: {
      guildId: true,
      aocKey: true,
      aocLeaderboardId: true,
    },
  });
};

export const saveLeaderboard = async (guildId: string, aocLeaderboardResponse: AocLeaderboard) => {
  const db = getDbClient();
  const [row] = await db
    .insert(aocLeaderboard)
    .values({ guildId, result: aocLeaderboardResponse })
    .onConflictDoUpdate({
      target: aocLeaderboard.guildId,
      set: { updatedAt: new Date(), result: aocLeaderboardResponse },
    })
    .returning({ result: aocLeaderboard.result, updatedAt: aocLeaderboard.updatedAt });

  return row;
};

type AocSettings = Pick<ServerChannelsSettingsSelect, 'aocKey' | 'aocLeaderboardId' | 'guildId'>;
export const fetchAndSaveLeaderboard = async (year: number, { aocKey, aocLeaderboardId, guildId }: AocSettings) => {
  if (!aocKey || !aocLeaderboardId) {
    const errorMessage = 'Cannot fetch leaderboard without key and leaderboard id';
    setSpanAttributes({ 'bot.aoc.success': false, 'bot.aoc.reason': 'missing-config' });
    logger.warn(`[fetch-and-save-leaderboard]: ${errorMessage}!`);
    throw new Error(errorMessage);
  }
  const aocLeaderboardResponse = await fetchLeaderboard(aocKey, aocLeaderboardId, year);

  const savedResult = await saveLeaderboard(guildId, aocLeaderboardResponse);

  return savedResult;
};

export const getSavedLeaderboard = async (guildId: string) => {
  const db = getDbClient();
  return db.query.aocLeaderboard.findFirst({
    where: { guildId },
    columns: { result: true, updatedAt: true },
  });
};

export const deleteLeaderboard = async (guildId: string) => {
  const db = getDbClient();
  return db.delete(aocLeaderboard).where(eq(aocLeaderboard.guildId, guildId));
};
