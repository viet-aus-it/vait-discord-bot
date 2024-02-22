import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { loadEnv } from '../utils/loadEnv';
import * as schema from './schema';

loadEnv();
const connectionString = process.env.DATABASE_URL;

const client = new Client({ connectionString });
await client.connect();
const db = drizzle(client, { schema });

export const getDbClient = () => db;
export const getMigrator = () => migrate;
