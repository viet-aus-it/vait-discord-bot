import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { loadEnv } from '../src/utils/load-env';

loadEnv();

const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vait-discord-bot';

const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
console.log({ otelEndpoint });
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: serviceName,
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

const instrumentations = getNodeAutoInstrumentations();

const sdk = new NodeSDK({
  resource,
  instrumentations: [instrumentations],
  traceExporter: new OTLPTraceExporter({ url: otelEndpoint }),
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Telemetry SDK shut down gracefully'))
    .catch((error) => console.error('Error shutting down telemetry SDK', error));
});
