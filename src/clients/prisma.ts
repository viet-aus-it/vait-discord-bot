import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  omit: {
    serverChannelsSettings: {
      aocKey: true,
    },
  },
});

export const getDbClient = () => prisma;
