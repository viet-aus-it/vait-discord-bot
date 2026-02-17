import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { loadEnv } from '../src/utils/load-env';

loadEnv();

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.VERBOSE);

const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vait-discord-bot';
const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

console.log({
  serviceName,
  otelEndpoint,
});

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: serviceName,
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

const instrumentations = getNodeAutoInstrumentations();

function getTraceExporter(): OTLPTraceExporter {
  const localTraceExporter = new OTLPTraceExporter({ url: otelEndpoint });

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

const sdk = new NodeSDK({
  resource,
  instrumentations: [instrumentations],
  traceExporter,
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
