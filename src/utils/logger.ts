import { WinstonTransport as AxiomTransport } from '@axiomhq/winston';
import winston from 'winston';
import { loadEnv } from './load-env';

const env = loadEnv();

const consoleTransport = new winston.transports.Console();
const prodFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());

function getLoggerOptions(): winston.LoggerOptions {
  if (env.NODE_ENV !== 'production') {
    return {
      level: 'debug',
      defaultMeta: { service: 'vait-chatbot-dev' },
      transports: [consoleTransport],
      format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.prettyPrint({ colorize: true })),
    };
  }

  if (env.ENABLE_OTEL) {
    return {
      level: 'info',
      defaultMeta: { service: 'vait-chatbot' },
      transports: [consoleTransport],
      format: prodFormat,
    };
  }

  const axiomTransport = new AxiomTransport({
    dataset: env.AXIOM_DATASET,
    token: env.AXIOM_TOKEN || '',
    orgId: env.AXIOM_ORG_ID,
  });

  return {
    level: 'info',
    defaultMeta: { service: 'vait-chatbot' },
    transports: [consoleTransport, axiomTransport],
    exceptionHandlers: [axiomTransport],
    rejectionHandlers: [axiomTransport],
    format: prodFormat,
  };
}

export const logger = winston.createLogger(getLoggerOptions());
