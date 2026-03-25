import type { Context } from '@opentelemetry/api';
import { SpanStatusCode } from '@opentelemetry/api';
import type { ReadableSpan, Span, SpanProcessor } from '@opentelemetry/sdk-trace-base';

interface FilteringProcessorConfig {
  /** The downstream processor (e.g., BatchSpanProcessor) */
  delegate: SpanProcessor;
  /** Sampling rate for unprocessed messages (default: 0.0001 = 1:10,000) */
  unprocessedRate?: number;
  /** Sampling rate for success (non-error) spans (default: 0.01 = 1%) */
  successRate?: number;
}

export class FilteringSpanProcessor implements SpanProcessor {
  private readonly delegate: SpanProcessor;
  private readonly unprocessedUpperBound: number;
  private readonly successUpperBound: number;

  constructor(config: FilteringProcessorConfig) {
    this.delegate = config.delegate;
    this.unprocessedUpperBound = Math.floor((config.unprocessedRate ?? 0.0001) * 0xffffffff);
    this.successUpperBound = Math.floor((config.successRate ?? 0.01) * 0xffffffff);
  }

  onStart(span: Span, parentContext: Context): void {
    this.delegate.onStart(span, parentContext);
  }

  onEnd(span: ReadableSpan): void {
    if (this.shouldExport(span)) {
      this.delegate.onEnd(span);
    }
  }

  forceFlush(): Promise<void> {
    return this.delegate.forceFlush();
  }

  shutdown(): Promise<void> {
    return this.delegate.shutdown();
  }

  private shouldExport(span: ReadableSpan): boolean {
    // Rule 1: Always keep error spans (100%)
    if (span.attributes.error === true || span.status.code === SpanStatusCode.ERROR) {
      return true;
    }

    const hash = this.hashTraceId(span.spanContext().traceId);

    // Rule 2: Sample unprocessed messages at unprocessedRate
    if (span.attributes['message.processed'] === false) {
      return hash < this.unprocessedUpperBound;
    }

    // Rule 3: Sample success spans at successRate
    return hash < this.successUpperBound;
  }

  /** Deterministic hash matching TraceIdRatioBasedSampler's approach */
  private hashTraceId(traceId: string): number {
    let acc = 0;
    for (let i = 0; i < traceId.length / 8; i++) {
      const part = Number.parseInt(traceId.slice(i * 8, i * 8 + 8), 16);
      acc = (acc ^ part) >>> 0;
    }
    return acc;
  }
}
