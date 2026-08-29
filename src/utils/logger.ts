import winston from 'winston';

import { loadEnv } from './load-env';

const env = loadEnv();

const consoleTransport = new winston.transports.Console();
const prodFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());
const devFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.prettyPrint({ colorize: true }));

function getLoggerOptions(): winston.LoggerOptions {
  if (env.NODE_ENV !== 'production') {
    return {
      level: 'debug',
      defaultMeta: { service: 'vait-chatbot-dev' },
      transports: [consoleTransport],
      exceptionHandlers: [consoleTransport],
      rejectionHandlers: [consoleTransport],
      format: devFormat,
    };
  }
  return {
    level: 'info',
    defaultMeta: { service: env.OTEL_SERVICE_NAME ?? 'vait-chatbot' },
    transports: [consoleTransport],
    exceptionHandlers: [consoleTransport],
    rejectionHandlers: [consoleTransport],
    format: prodFormat,
  };
}

export const logger = winston.createLogger(getLoggerOptions());
