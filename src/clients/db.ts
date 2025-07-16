import { PrismaClient } from '@prisma/client';

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
