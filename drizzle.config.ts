import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/clients/database/schema/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
