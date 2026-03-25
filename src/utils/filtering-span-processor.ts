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
  private readonly unprocessedRate: number;
  private readonly successRate: number;

  constructor(config: FilteringProcessorConfig) {
    this.delegate = config.delegate;
    this.unprocessedRate = config.unprocessedRate ?? 0.0001;
    this.successRate = config.successRate ?? 0.01;
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
    if (span.attributes['app.error'] === true || span.status.code === SpanStatusCode.ERROR) {
      return true;
    }

    const ratio = this.traceIdToRatio(span.spanContext().traceId);

    // Rule 2: Sample unprocessed messages at unprocessedRate
    if (span.attributes['app.message.processed'] === false) {
      return ratio < this.unprocessedRate;
    }

    // Rule 3: Sample success spans at successRate
    return ratio < this.successRate;
  }

  /**
   * Convert a 32-char hex traceId to a deterministic ratio in [0, 1).
   *
   * Takes the last 8 hex characters (32 bits of entropy) and divides by 2^32
   * to produce a uniformly distributed value. The same traceId always yields
   * the same ratio, so a given trace is consistently sampled or dropped across
   * restarts. Comparing this ratio against the configured rate threshold
   * determines whether the span is exported.
   */
  private traceIdToRatio(traceId: string): number {
    const last8 = traceId.slice(-8);
    return Number.parseInt(last8, 16) / 0x100000000;
  }
}
