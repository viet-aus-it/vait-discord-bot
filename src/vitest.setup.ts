import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import { server } from './mocks/server';

const consoleErrorSpy = vi.spyOn(console, 'error');

beforeAll(() => {
  server.listen();
  consoleErrorSpy.mockImplementation(() => {});
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
  consoleErrorSpy.mockRestore();
});

process.env.TOKEN = faker.finance.accountNumber(10);
