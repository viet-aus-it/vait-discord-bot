import { afterAll, afterEach, beforeAll } from 'vitest';
import { logger } from '../../src/utils/logger';
import { server } from './server';

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
