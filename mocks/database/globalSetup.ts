import childProcess from 'node:child_process';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { beforeAll } from 'vitest';

beforeAll(async () => {
  console.log('Starting Database');
  const db = await new PostgreSqlContainer('postgres:15-alpine').start();
  const databaseUrl = db.getConnectionUri();
  process.env.DATABASE_URL = databaseUrl;
  console.log('Database started', databaseUrl);
  console.log('ENV DB', process.env.DATABASE_URL);

  console.log('Running Prisma Migrate');
  childProcess.execSync('pnpm run prisma:migrate');
  console.log('Prisma Migrate ran');

  return async () => {
    console.log('Stopping Database');
    await db.stop();
    console.log('Database stopped');
  };
});
