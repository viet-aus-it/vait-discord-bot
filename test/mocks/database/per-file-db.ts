import pg from 'pg';
import { afterAll, beforeEach } from 'vitest';
import { cleanDb } from '../../fixtures/db-seed';

const baseUrl = process.env.DATABASE_URL || '';
const parsed = new URL(baseUrl);
const templateDb = parsed.pathname.slice(1);
const workerDb = `${templateDb}_${process.env.VITEST_POOL_ID ?? process.pid}`;

const adminUrl = new URL(baseUrl);
adminUrl.pathname = '/postgres';

const client = new pg.Client({ connectionString: adminUrl.toString() });
await client.connect();
await client.query(`DROP DATABASE IF EXISTS "${workerDb}"`);
await client.query(`CREATE DATABASE "${workerDb}" TEMPLATE "${templateDb}"`);
await client.end();

const workerUrl = new URL(baseUrl);
workerUrl.pathname = `/${workerDb}`;
process.env.DATABASE_URL = workerUrl.toString();

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  const { disconnectDb } = await import('../../../src/clients/db');
  await disconnectDb();

  const dropClient = new pg.Client({ connectionString: adminUrl.toString() });
  await dropClient.connect();
  await dropClient.query(`DROP DATABASE IF EXISTS "${workerDb}"`);
  await dropClient.end();
});
