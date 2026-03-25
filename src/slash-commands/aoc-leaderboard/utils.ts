import { getDbClient } from '../../clients';
import type { ServerChannelsSettings } from '../../clients/prisma/generated/client/client';
import type { InputJsonValue } from '../../clients/prisma/generated/client/internal/prismaNamespace';
import { logger } from '../../utils/logger';
import { tracer } from '../../utils/tracer';
import { fetchLeaderboard } from './client';
import type { AocLeaderboard } from './schema';

export const getAocSettings = async (guildId: string) => {
  return tracer.startActiveSpan('db.aocLeaderboard.getAocSettings', async (span) => {
    try {
      const db = getDbClient();
      return db.serverChannelsSettings.findFirst({
        where: { guildId },
        select: {
          guildId: true,
          aocKey: true,
          aocLeaderboardId: true,
        },
      });
    } finally {
      span.end();
    }
  });
};

export const saveLeaderboard = async (guildId: string, aocLeaderboardResponse: AocLeaderboard) => {
  return tracer.startActiveSpan('db.aocLeaderboard.saveLeaderboard', async (span) => {
    try {
      const db = getDbClient();
      return db.aocLeaderboard.upsert({
        where: { guildId },
        update: {
          updatedAt: new Date(),
          result: aocLeaderboardResponse as InputJsonValue,
        },
        create: {
          guildId,
          result: aocLeaderboardResponse as InputJsonValue,
        },
        select: {
          result: true,
          updatedAt: true,
        },
      });
    } finally {
      span.end();
    }
  });
};

type AocSettings = Pick<ServerChannelsSettings, 'aocKey' | 'aocLeaderboardId' | 'guildId'>;
export const fetchAndSaveLeaderboard = async (year: number, { aocKey, aocLeaderboardId, guildId }: AocSettings) => {
  return tracer.startActiveSpan('db.aocLeaderboard.fetchAndSaveLeaderboard', async (span) => {
    try {
      if (!aocKey || !aocLeaderboardId) {
        const errorMessage = 'Cannot fetch leaderboard without key and leaderboard id';
        logger.error(`[fetch-and-save-leaderboard]: ${errorMessage}!`);
        throw new Error(errorMessage);
      }
      const aocLeaderboardResponse = await fetchLeaderboard(aocKey, aocLeaderboardId, year);

      const savedResult = await saveLeaderboard(guildId, aocLeaderboardResponse);

      return savedResult;
    } finally {
      span.end();
    }
  });
};

export const getSavedLeaderboard = async (guildId: string) => {
  return tracer.startActiveSpan('db.aocLeaderboard.getSavedLeaderboard', async (span) => {
    try {
      const db = getDbClient();
      return db.aocLeaderboard.findFirst({
        where: { guildId },
        select: {
          result: true,
          updatedAt: true,
        },
      });
    } finally {
      span.end();
    }
  });
};

export const deleteLeaderboard = async (guildId: string) => {
  return tracer.startActiveSpan('db.aocLeaderboard.deleteLeaderboard', async (span) => {
    try {
      const db = getDbClient();
      return db.aocLeaderboard.delete({
        where: { guildId },
      });
    } finally {
      span.end();
    }
  });
};
