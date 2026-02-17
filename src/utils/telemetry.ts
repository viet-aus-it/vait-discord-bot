import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const serviceName = 'vait-discord-bot';

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
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: otelEndpoint,
      }),
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Telemetry SDK shut down gracefully'))
    .catch((error) => console.error('Error shutting down telemetry SDK', error));
});
