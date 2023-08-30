import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';
import { logger } from './utils/logger';

beforeAll(() => {
  server.listen();
  logger.silent = true;
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
  logger.silent = false;
});
