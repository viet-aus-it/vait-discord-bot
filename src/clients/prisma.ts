import { PrismaClient } from '@prisma/client';
import type { AocLeaderboard } from '../slash-commands/aoc-leaderboard/schema';

declare global {
  namespace PrismaJson {
    type AocLeaderboardData = AocLeaderboard;
  }
}

const prisma = new PrismaClient({
  omit: {
    serverChannelsSettings: {
      aocKey: true,
    },
  },
});

export const getDbClient = () => prisma;
