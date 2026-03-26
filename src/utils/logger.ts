import { WinstonTransport as AxiomTransport } from '@axiomhq/winston';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import winston from 'winston';
import { loadEnv } from './load-env';

const env = loadEnv();

const consoleTransport = new winston.transports.Console();
const axiomTransport = new AxiomTransport({
  dataset: env.AXIOM_DATASET,
  token: env.AXIOM_TOKEN || '',
  orgId: env.AXIOM_ORG_ID,
});
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
  transports: [consoleTransport, axiomTransport],
  exceptionHandlers: [axiomTransport],
  rejectionHandlers: [axiomTransport],
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
  if (env.NODE_ENV !== 'production') return devOptions;
  if (env.ENABLE_OTEL) return prodOptionsWithTelemetry;
  return prodOptions;
}

export const logger = winston.createLogger(getLoggerOptions());
