import pino from 'pino';
import { loadEnv } from './load-env';

loadEnv();

const devOptions: pino.LoggerOptions = {
  name: 'vait-chatbot-dev',
  level: 'debug',
  timestamp: true,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  enabled: !process.env.VITEST,
};

const prodOptions: pino.LoggerOptions = {
  name: 'vait-chatbot',
  level: 'info',
  timestamp: true,
  transport: {
    targets: [
      {
        target: 'pino/file',
        options: {
          destination: 1,
        },
      },
    ],
  },
};

export const logger = pino(process.env.NODE_ENV === 'production' ? prodOptions : devOptions);
