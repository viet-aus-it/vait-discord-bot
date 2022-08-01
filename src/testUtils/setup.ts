import { beforeAll, afterAll, afterEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { server } from './mocks/server';

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(async () => server.close());

process.env.TOKEN = faker.finance.account(10);
