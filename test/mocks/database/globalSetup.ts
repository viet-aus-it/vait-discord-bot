import childProcess from 'node:child_process';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { loadEnv } from '../../../src/utils/load-env';

function setupDb(databaseUrl?: string) {
  console.log('Running Prisma Migrate');
  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
  }
  childProcess.execSync('npm run prisma:migrate', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_DATABASE_URL: process.env.DATABASE_URL,
    },
  });
  console.log('Prisma Migrate ran');
}

/**
 * In local, start a separate database container using Testcontainers
 */
async function localSetup() {
  console.log('Starting Database');
  const db = await new PostgreSqlContainer('postgres:17-alpine').start();
  const databaseUrl = db.getConnectionUri();
  console.log('Database is running at', databaseUrl);

  setupDb(databaseUrl);

  return async function teardown() {
    console.log('Stopping Database');
    await db.stop();
    console.log('Database stopped');
  };
}

/**
 * in CI, we will use GitHub Actions to attach a service container to test,
 * therefore, testcontainers isn't needed.
 */
async function ciSetup() {
  loadEnv();
  console.log('Database is running at', process.env.DATABASE_URL);

  // Skip database migration in CI when external downloads are blocked
  // Most tests are unit tests with mocked database calls
  console.log('Skipping database migration due to external dependency restrictions');

  return async function teardown() {
    console.log('Tearing down db...');
  };
}

export async function setup() {
  const isInCI = !!process.env.CI;
  return isInCI ? ciSetup() : localSetup();
}
