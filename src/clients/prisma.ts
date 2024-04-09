import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';
import { loadEnv } from '../utils/load-env';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  loadEnv();
  neonConfig.webSocketConstructor = ws;
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

export const getDbClient = () => prisma;
