import pgSetup from '@databases/pg-test/jest/globalSetup';
import pgTeardown from '@databases/pg-test/jest/globalTeardown';

export async function setup() {
  await pgSetup({
    image: 'postgres:13-alpine',
    migrationsScript: ['pnpm', 'prisma:migrate', '&&', 'pnpm', 'prisma:gen'],
  });
}

export async function teardown() {
  await pgTeardown();
}
