import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor, SimpleSpanProcessor, type SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { FilteringSpanProcessor } from '../src/utils/filtering-span-processor';
import { loadEnv } from '../src/utils/load-env';

const env = loadEnv();

if (env.ENABLE_OTEL) {
  console.log('Starting OpenTelemetry');
  startTelemetry();
} else {
  console.log('Skip enabling OpenTelemetry');
}

function getExporterHeaders(): Record<string, string> {
  if (env.NODE_ENV === 'production') {
    return {
      Authorization: `Bearer ${env.AXIOM_TOKEN || ''}`,
      'X-Axiom-Dataset': env.AXIOM_DATASET || '',
    };
  }
  return {};
}

function getLogRecordProcessor(exporter: OTLPLogExporter) {
  if (env.NODE_ENV === 'production') {
    return new BatchLogRecordProcessor(exporter);
  }
  return new SimpleLogRecordProcessor(exporter);
}

function getSpanProcessor(exporter: OTLPTraceExporter): SpanProcessor {
  if (env.NODE_ENV === 'production') {
    return new FilteringSpanProcessor({
      delegate: new BatchSpanProcessor(exporter),
      successRate: 0.01, // 1%
    });
  }

  return new SimpleSpanProcessor(exporter);
}

function startTelemetry() {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: '1.0.0',
  });

  const instrumentations = getNodeAutoInstrumentations();
  const prismaInstrumentation = new PrismaInstrumentation();

  if (env.OTEL_DEBUG) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
  }

  const headers = getExporterHeaders();
  const traceExporter = new OTLPTraceExporter({ headers });
  const spanProcessor = getSpanProcessor(traceExporter);
  const logExporter = new OTLPLogExporter({ headers });
  const logRecordProcessor = getLogRecordProcessor(logExporter);

  const sdk = new NodeSDK({
    resource,
    instrumentations: [instrumentations, prismaInstrumentation],
    spanProcessors: [spanProcessor],
    logRecordProcessors: [logRecordProcessor],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    traceExporter.forceFlush();
    traceExporter.shutdown();
    logExporter.forceFlush();
    logExporter.shutdown();

    sdk
      .shutdown()
      .then(() => console.log('Telemetry SDK shut down gracefully'))
      .catch((error) => console.error('Error shutting down telemetry SDK', error));
  });
}
