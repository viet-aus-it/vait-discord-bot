import winston from 'winston';
import { WinstonTransport as AxiomTransport } from '@axiomhq/winston';
import { loadEnv } from '../loadEnv';

loadEnv();

const consoleTransport = new winston.transports.Console();
const axiomTransport = new AxiomTransport({
  dataset: process.env.AXIOM_DATASET,
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
});

const devOptions: winston.LoggerOptions = {
  level: 'debug',
  defaultMeta: { service: 'vait-chatbot-dev', timestamp: Date.now() },
  transports: [consoleTransport],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint({ colorize: true })
  ),
};

const prodOptions: winston.LoggerOptions = {
  level: 'info',
  defaultMeta: { service: 'vait-chatbot', timestamp: Date.now() },
  transports: [consoleTransport, axiomTransport],
  exceptionHandlers: [axiomTransport],
  rejectionHandlers: [axiomTransport],
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
};

export const logger = winston.createLogger(
  process.env.NODE_ENV === 'production' ? prodOptions : devOptions
);
