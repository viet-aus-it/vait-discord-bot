import { afterAll, beforeAll } from 'vitest';
import { logger } from '../../src/utils/logger';

beforeAll(() => {
  logger.silent = true;
});

afterAll(() => {
  logger.silent = false;
});
