import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vait-discord-bot';

const traceEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: serviceName,
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

const instrumentations = getNodeAutoInstrumentations({
  '@opentelemetry/instrumentation-fs': { enabled: false },
});

const sdk = new NodeSDK({
  resource,
  instrumentations: [instrumentations],
  traceExporter: traceEndpoint ? new OTLPTraceExporter({ url: traceEndpoint }) : undefined,
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Telemetry SDK shut down gracefully'))
    .catch((error) => console.error('Error shutting down telemetry SDK', error));
});
