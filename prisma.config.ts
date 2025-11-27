import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  experimental: {
    adapter: true,
    studio: true,
  },
  datasource: {
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_DATABASE_URL'),
  },
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  async adapter() {
    return new PrismaPg({ connectionString: process.env.DATABASE_URL });
  },
  studio: {
    async adapter() {
      return new PrismaPg({ connectionString: process.env.DATABASE_URL });
    },
  },
});
