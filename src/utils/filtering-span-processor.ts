import type { Context } from '@opentelemetry/api';
import { SpanStatusCode } from '@opentelemetry/api';
import type { ReadableSpan, Span, SpanProcessor } from '@opentelemetry/sdk-trace-base';

interface FilteringProcessorConfig {
  /** The downstream processor (e.g., BatchSpanProcessor) */
  delegate: SpanProcessor;
  /** Sampling rate for success (non-error) spans (default: 0.01 = 1%) */
  successRate?: number;
}

export class FilteringSpanProcessor implements SpanProcessor {
  private readonly delegate: SpanProcessor;
  private readonly successRate: number;

  constructor(config: FilteringProcessorConfig) {
    this.delegate = config.delegate;
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

  /**
   * Determining if we should export a span or not
   *
   * The rules:
   * - if a message is unprocessed, we should just drop it since that's not
   * relevant to our bot.
   * - if a message has an error, we ALWAYS report that.
   * - otherwise, if it's an success, then it's business as usual. We will sample it out
   * to the set `successRate` so that they won't add too much noise and we save on ingress cost
   * and stay within the free tier.
   */
  private shouldExport(span: ReadableSpan): boolean {
    // Rule 1: Drop unprocessed messages entirely
    if (span.attributes['discord.message.processed'] === false) {
      return false;
    }

    // Rule 2: Always keep error spans (100%)
    if (span.status.code === SpanStatusCode.ERROR) {
      return true;
    }

    // Rule 3: Sample success spans at successRate
    const ratio = this.traceIdToRatio(span.spanContext().traceId);
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
