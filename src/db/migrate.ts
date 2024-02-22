import path from 'node:path';
import { logger } from '../utils/logger';
import { getDbClient, getMigrator } from './drizzle';

async function runMigrate() {
  logger.info('Running migrations');
  try {
    const drizzle = getDbClient();
    const migrate = getMigrator();
    const migrationsFolder = path.resolve(__dirname, '..', '..', 'drizzle');
    await migrate(drizzle, { migrationsFolder });
    logger.info('Migrations ran successfully');
  } catch (error) {
    logger.error('Error running migrations', error);
  }
}

runMigrate();
