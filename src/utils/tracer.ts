import { SpanStatusCode, trace } from '@opentelemetry/api';

export const tracer = trace.getTracer('discord-bot');

export function recordSpanError(error: unknown, slug: string): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
  span.recordException(error instanceof Error ? error : new Error(String(error)));
  span.setAttribute('error.type', slug);
}
