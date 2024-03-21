import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const consoleTraceExporter = new ConsoleSpanExporter();
const axiomTraceExporter = new OTLPTraceExporter({
  url: 'https://api.axiom.co/v1/traces',
  headers: {
    Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
    'X-Axiom-Dataset': process.env.AXIOM_DATASET,
  },
});
const traceExporter = process.env.NODE_ENV === 'production' ? axiomTraceExporter : consoleTraceExporter;

const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: 'discord-bot',
});

const sdk = new NodeSDK({
  spanProcessor: new BatchSpanProcessor(traceExporter),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  resource,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
