import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      clean: true,
      exclude: [
        'src/vitest.setup.ts',
        'src/utils/random/*',
        'src/mocks/*',
        'src/clients/*',
      ],
    },
    clearMocks: true,
    setupFiles: ['./src/vitest.setup.ts'],
  },
});
