import { setupServer } from 'msw/node';
import { aocHandlers } from './aoc-handlers';

export const server = setupServer(...aocHandlers);
