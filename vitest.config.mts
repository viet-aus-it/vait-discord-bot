import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      clean: true,
      include: ['src/**/*.ts'],
      exclude: ['src/utils/random.*', 'src/config.ts', 'src/deploy-command.ts', 'src/clients/**.ts', 'src/*-commands/index.ts', 'src/*-commands/**/utils.ts'],
    },
    clearMocks: true,
    setupFiles: ['./mocks/logger/setup.ts', './mocks/msw/setup.ts'],
    globalSetup: ['./mocks/database/globalSetup.ts'],
  },
});
