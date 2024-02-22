import { Pool } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { loadEnv } from '../utils/loadEnv';

let db: ReturnType<typeof drizzlePg> | ReturnType<typeof drizzleNeon>;

loadEnv();
const connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ connectionString });
  db = drizzleNeon(pool);
} else {
  const client = new Client({ connectionString });
  await client.connect();
  db = drizzlePg(client);
}

export const getDrizzleClient = () => db;
