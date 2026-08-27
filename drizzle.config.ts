import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/clients/database/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
