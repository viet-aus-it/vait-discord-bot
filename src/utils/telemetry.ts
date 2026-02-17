import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SEMRESATTRS_DEPLOYMENT_ENVIRONMENT, SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vait-discord-bot';
const isProduction = process.env.NODE_ENV === 'production';

const traceEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

const resource = resourceFromAttributes({
  [SEMRESATTRS_SERVICE_NAME]: serviceName,
  [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: isProduction ? 'production' : 'development',
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
