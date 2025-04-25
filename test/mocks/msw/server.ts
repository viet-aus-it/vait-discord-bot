import { setupServer } from 'msw/node';
import { aocHandlers } from './aoc-handlers';
import { qotdHandlers } from './qotd-handlers';
import { weatherHandlers } from './weather-handlers';

export const server = setupServer(...aocHandlers, ...qotdHandlers, ...weatherHandlers);
