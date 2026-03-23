import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './prisma/generated/client/client';

let prisma: InstanceType<typeof PrismaClient> | undefined;

export function getDbClient() {
  if (!prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({
      adapter,
      omit: {
        serverChannelsSettings: {
          aocKey: true,
        },
      },
    });
  }

  return prisma;
}

export async function disconnectDb() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = undefined;
  }
}
