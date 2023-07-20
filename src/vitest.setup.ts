import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import { getLogger } from './utils/logger';
import { server } from './mocks/server';
import winston from 'winston';

vi.mock('./utils/logger');
const mockGetLogger = vi.mocked(getLogger);

beforeAll(() => {
  server.listen();
  mockGetLogger.mockReturnValue({
    info: () => {},
    error: () => {},
  } as unknown as winston.Logger);
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
  mockGetLogger.mockRestore();
});
