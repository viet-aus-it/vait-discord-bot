import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
