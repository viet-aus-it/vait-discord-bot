import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      clean: true,
      include: ['src/commands/**/*.ts', 'src/utils/**/*.ts'],
      exclude: ['src/utils/random.*'],
    },
    clearMocks: true,
    setupFiles: ['./src/vitest.setup.ts'],
  },
});
