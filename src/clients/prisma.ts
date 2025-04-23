import { PrismaClient } from '../generated/prisma';
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
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const getDbClient = () => prisma;
