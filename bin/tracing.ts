import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor, NodeTracerProvider, SimpleSpanProcessor, type SpanExporter, type SpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const SERVICE_NAME = 'discord-bot';

function getTraceExporter(): SpanExporter {
  const localExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  });

  const axiomTraceExporter = new OTLPTraceExporter({
    url: 'https://api.axiom.co/v1/traces',
    headers: {
      Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
      'X-Axiom-Dataset': process.env.AXIOM_DATASET,
    },
  });

  return process.env.NODE_ENV === 'production' ? axiomTraceExporter : localExporter;
}

function getTraceProcessor(exporter: SpanExporter): SpanProcessor {
  return process.env.NODE_ENV === 'production' ? new BatchSpanProcessor(exporter) : new SimpleSpanProcessor(exporter);
}

export function setupTracer() {
  diag.setLogger(new DiagConsoleLogger(), process.env.NODE_ENV === 'production' ? DiagLogLevel.NONE : DiagLogLevel.ERROR);
  const exporter = getTraceExporter();
  const processor = getTraceProcessor(exporter);
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
    }),
    spanProcessors: [processor],
  });
  provider.register();

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [getNodeAutoInstrumentations(), new PrismaInstrumentation({ middleware: true, enabled: true })],
  });

  process.on('SIGTERM', async () => {
    await provider.forceFlush();
    await provider.shutdown();
  });
}
