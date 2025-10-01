import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnv } from '../utils/load-env';
import { PrismaClient } from './prisma/generated/client/client';

loadEnv();

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
