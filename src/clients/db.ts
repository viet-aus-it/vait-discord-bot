import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './prisma/generated/client/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  omit: {
    serverChannelsSettings: {
      aocKey: true,
    },
  },
});

export const getDbClient = () => prisma;
