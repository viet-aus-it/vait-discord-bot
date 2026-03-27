import { SpanStatusCode, trace } from '@opentelemetry/api';
import { ATTR_ERROR_TYPE } from '@opentelemetry/semantic-conventions';

export const tracer = trace.getTracer('discord-bot');

export function recordSpanError(error: unknown, slug: string): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
  span.recordException(error instanceof Error ? error : new Error(String(error)));
  span.setAttribute(ATTR_ERROR_TYPE, slug);
}

export function setSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  for (const [key, value] of Object.entries(attributes)) {
    span.setAttribute(key, value);
  }
}
