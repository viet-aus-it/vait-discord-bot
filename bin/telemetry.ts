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

const env = loadEnv();

function getExporterHeaders(): Record<string, string> {
  if (env.NODE_ENV === 'production') {
    return {
      Authorization: `Bearer ${env.AXIOM_TOKEN || ''}`,
      'X-Axiom-Dataset': env.AXIOM_DATASET || '',
    };
  }
  return { Authorization: env.OPENOBSERVE_AUTH_TOKEN ?? '' };
}

function getTraceExporter(otelEndpoint: string): OTLPTraceExporter {
  return new OTLPTraceExporter({ url: otelEndpoint, headers: getExporterHeaders() });
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
  const otelEndpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT ?? '';
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: '1.0.0',
  });

  const instrumentations = getNodeAutoInstrumentations();
  const prismaInstrumentation = new PrismaInstrumentation();

  if (env.OTEL_DEBUG) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
  }

  const traceExporter = getTraceExporter(otelEndpoint);
  const spanProcessor = getSpanProcessor(traceExporter);

  const sdk = new NodeSDK({
    resource,
    instrumentations: [instrumentations, prismaInstrumentation],
    spanProcessors: [spanProcessor],
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
}

if (env.ENABLE_OTEL) {
  console.log('Starting OpenTelemetry');
  startTelemetry();
} else {
  console.log('Skip enabling OpenTelemetry');
}
