import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema/schema';

let db: ReturnType<typeof createDb> | undefined;

function createDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool, { schema });
}

export function getDbClient() {
  if (!db) db = createDb();
  return db;
}

export async function disconnectDb() {
  if (db) {
    await db.$client.end();
    db = undefined;
  }
}

export { schema };
