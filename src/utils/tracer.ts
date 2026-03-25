import { type Span, SpanStatusCode, trace } from '@opentelemetry/api';

export const tracer = trace.getTracer('discord-bot');

export function recordSpanError(span: Span, error: unknown, slug: string): void {
  span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
  span.recordException(error instanceof Error ? error : new Error(String(error)));
  span.setAttribute('error.type', slug);
}

/**
 * Set attributes on the active span from anywhere in the call stack.
 * No-op if no span is active (e.g., when OTEL is disabled).
 */
export function setSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  for (const [key, value] of Object.entries(attributes)) {
    span.setAttribute(key, value);
  }
}
