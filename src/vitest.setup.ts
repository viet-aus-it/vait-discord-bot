import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { logger } from './utils/logger';
import { server } from './mocks/server';

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
