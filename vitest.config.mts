import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'v8',
      clean: true,
      include: ['src/**/*.ts'],
      exclude: ['src/utils/random.*', 'src/config.ts', 'src/deploy-command.ts', 'src/clients/**.ts', 'src/*-commands/index.ts'],
    },
    env: {
      TOKEN: 'test-token',
      CLIENT_ID: 'test-client-id',
    },
    clearMocks: true,
    setupFiles: ['./test/mocks/database/per-file-db.ts', './test/mocks/msw/setup.ts'],
    globalSetup: ['./test/mocks/database/globalSetup.ts'],
  },
});
