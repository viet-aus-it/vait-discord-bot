import type { ServerChannelsSettings } from '@prisma/client';
import { getDbClient } from '../../clients';
import { logger } from '../../utils/logger';
import { fetchLeaderboard } from './client';

export const getAocSettings = async (guildId: string) => {
  const db = getDbClient();
  return db.serverChannelsSettings.findFirst({
    where: { guildId },
    select: {
      guildId: true,
      aocKey: true,
      aocLeaderboardId: true,
    },
  });
};

type AocSettings = Pick<ServerChannelsSettings, 'aocKey' | 'aocLeaderboardId' | 'guildId'>;
export const fetchAndSaveLeaderboard = async (year: number, { aocKey, aocLeaderboardId, guildId }: AocSettings) => {
  if (!aocKey || !aocLeaderboardId) {
    const errorMessage = 'Cannot fetch leaderboard without key and leaderboard id';
    logger.error(`[fetch-and-save-leaderboard]: ${errorMessage}!`);
    throw new Error(errorMessage);
  }
  const aocLeaderboardResponse = await fetchLeaderboard(aocKey, aocLeaderboardId, year);

  const db = getDbClient();
  const savedResult = await db.aocLeaderboard.upsert({
    where: { guildId },
    update: {
      updatedAt: new Date(),
      result: aocLeaderboardResponse,
    },
    create: {
      guildId,
      result: aocLeaderboardResponse,
    },
    select: {
      result: true,
      updatedAt: true,
    },
  });

  return savedResult;
};

export const getSavedLeaderboard = async (guildId: string) => {
  const db = getDbClient();
  return db.aocLeaderboard.findFirst({
    where: { guildId },
    select: {
      result: true,
      updatedAt: true,
    },
  });
};
