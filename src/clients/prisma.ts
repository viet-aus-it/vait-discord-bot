import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';
import { loadEnv } from '../utils/load-env';

let prisma: PrismaClient;

loadEnv();
const DATABASE_URL = process.env.DATABASE_URL;

if (process.env.NODE_ENV === 'production') {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });
}

export const getDbClient = () => prisma;
