import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import winston from 'winston';
import { loadEnv } from './load-env';

loadEnv();

const consoleTransport = new winston.transports.Console();
const otelTransport = new OpenTelemetryTransportV3();

const devOptions: winston.LoggerOptions = {
  level: 'debug',
  defaultMeta: { service: 'vait-chatbot-dev', timestamp: Date.now() },
  transports: [consoleTransport],
  format: winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint({ colorize: true })),
};

const prodOptions: winston.LoggerOptions = {
  level: 'info',
  defaultMeta: { service: 'vait-chatbot', timestamp: Date.now() },
  transports: [consoleTransport],
  format: winston.format.combine(winston.format.errors({ stack: true }), winston.format.json()),
};

const prodOptionsWithTelemetry: winston.LoggerOptions = {
  level: 'info',
  defaultMeta: { service: 'vait-chatbot', timestamp: Date.now() },
  transports: [consoleTransport, otelTransport],
  exceptionHandlers: [otelTransport],
  rejectionHandlers: [otelTransport],
  format: winston.format.combine(winston.format.errors({ stack: true }), winston.format.json()),
};

function getLoggerOptions(): winston.LoggerOptions {
  if (process.env.NODE_ENV !== 'production') {
    return devOptions;
  }

  if (process.env.ENABLE_OTEL === 'true') {
    return prodOptionsWithTelemetry;
  }

  return prodOptions;
}

export const logger = winston.createLogger(getLoggerOptions());
