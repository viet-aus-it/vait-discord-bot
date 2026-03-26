import { type Span, SpanStatusCode, trace } from '@opentelemetry/api';

export const tracer = trace.getTracer('discord-bot');

export function recordSpanError(span: Span, error: unknown, slug: string): void {
  span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
  span.recordException(error instanceof Error ? error : new Error(String(error)));
  span.setAttribute('error.type', slug);
}
