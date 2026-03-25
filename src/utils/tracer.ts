import { type Span, trace } from '@opentelemetry/api';

export const tracer = trace.getTracer('discord-bot');

export function recordSpanError(span: Span, error: unknown, slug: string): void {
  span.setAttribute('error', true);
  span.setAttribute('error.message', String(error));
  span.setAttribute('error.slug', slug);
}
