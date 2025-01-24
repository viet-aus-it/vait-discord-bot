import childProcess from 'node:child_process';
import dotenv from '@dotenvx/dotenvx';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

function migrateDb() {
  console.log('Running Prisma Migrate');
  childProcess.execSync('pnpm run prisma:migrate');
  console.log('Prisma Migrate ran');
}

async function localSetup() {
  console.log('Starting Database');
  const db = await new PostgreSqlContainer('postgres:17-alpine').start();
  const databaseUrl = db.getConnectionUri();
  process.env.DATABASE_URL = databaseUrl;
  console.log('Database started', databaseUrl);
  console.log('ENV DB', process.env.DATABASE_URL);

  migrateDb();

  return async function teardown() {
    console.log('Stopping Database');
    await db.stop();
    console.log('Database stopped');
  };
}

async function ciSetup() {
  dotenv.config();
  console.log('Database is running at ', process.env.DATABASE_URL);

  migrateDb();

  return async function teardown() {
    console.log('Tearing down db...');
  };
}

export async function setup() {
  const isInCI = !!process.env.CI;

  if (isInCI) {
    return ciSetup();
  }

  return localSetup();
}
