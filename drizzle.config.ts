import { defineConfig } from 'drizzle-kit';
import { loadEnv } from './src/utils/loadEnv';

loadEnv();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
});
