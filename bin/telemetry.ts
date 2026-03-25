import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor, SimpleSpanProcessor, type SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { FilteringSpanProcessor } from '../src/utils/filtering-span-processor';
import { loadEnv } from '../src/utils/load-env';

loadEnv();

const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vait-discord-bot';
const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: serviceName,
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

const instrumentations = getNodeAutoInstrumentations();
const prismaInstrumentation = new PrismaInstrumentation();

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

function getTraceExporter(): OTLPTraceExporter {
  const localTraceExporter = new OTLPTraceExporter({
    url: otelEndpoint,
    headers: { Authorization: process.env.OPENOBSERVE_AUTH_TOKEN ?? '' },
  });

  const productionTraceExporter = new OTLPTraceExporter({
    url: otelEndpoint,
    headers: {
      Authorization: process.env.AXIOM_TOKEN || '',
      'X-Axiom-Dataset': process.env.AXIOM_DATASET || '',
    },
  });

  return process.env.NODE_ENV === 'production' ? productionTraceExporter : localTraceExporter;
}
const traceExporter = getTraceExporter();

function getSpanProcessor(exporter: OTLPTraceExporter): SpanProcessor {
  if (process.env.NODE_ENV === 'production') {
    return new FilteringSpanProcessor({
      delegate: new BatchSpanProcessor(exporter),
      unprocessedRate: 0.0001, // 1:10,000
      successRate: 0.01, // 1%
    });
  }

  return new SimpleSpanProcessor(exporter);
}
const spanProcessor = getSpanProcessor(traceExporter);

const sdk = new NodeSDK({
  resource,
  instrumentations: [instrumentations, prismaInstrumentation],
  spanProcessors: [spanProcessor],
  metricReaders: [],
  logRecordProcessors: [],
});

sdk.start();

process.on('SIGTERM', () => {
  traceExporter.forceFlush();
  traceExporter.shutdown();

  sdk
    .shutdown()
    .then(() => console.log('Telemetry SDK shut down gracefully'))
    .catch((error) => console.error('Error shutting down telemetry SDK', error));
});
