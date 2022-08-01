import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      enabled: true,
      clean: true,
      excludeNodeModules: true,
      exclude: [
        'src/vitest.setup.ts',
        'src/utils/random/*',
        'src/mocks/*',
        'src/clients/*',
      ],
    },
    clearMocks: true,
    globalSetup: ['./src/testUtils/globals-db.ts'],
    setupFiles: ['./src/testUtils/setup.ts'],
  },
});
