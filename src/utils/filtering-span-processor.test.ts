import { type SpanContext, SpanStatusCode } from '@opentelemetry/api';
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { describe, expect, it } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { FilteringSpanProcessor } from './filtering-span-processor';

const createMockSpan = (overrides: { attributes?: ReadableSpan['attributes']; statusCode?: SpanStatusCode; traceId?: string }) => {
  const spanContext = mockDeep<SpanContext>({
    traceId: overrides.traceId ?? '00000000000000000000000000000000',
    spanId: '0000000000000000',
    traceFlags: 1,
  });
  const span = mockDeep<ReadableSpan>({
    attributes: overrides.attributes ?? {},
    status: { code: overrides.statusCode ?? SpanStatusCode.UNSET },
  });
  span.spanContext.mockReturnValue(spanContext);
  return span;
};

describe('FilteringSpanProcessor', () => {
  it('always exports spans with ERROR status code', () => {
    const delegate = mockDeep<SpanProcessor>();
    const processor = new FilteringSpanProcessor({ delegate, successRate: 0 });

    const span = createMockSpan({ statusCode: SpanStatusCode.ERROR });
    processor.onEnd(span);

    expect(delegate.onEnd).toHaveBeenCalledWith(span);
  });

  describe('unprocessed messages are sampled at unprocessedRate', () => {
    it('drops unprocessed message spans when rate is 0', () => {
      const delegate = mockDeep<SpanProcessor>();
      const processor = new FilteringSpanProcessor({ delegate, unprocessedRate: 0 });

      const span = createMockSpan({ attributes: { 'discord.message.processed': false } });
      processor.onEnd(span);

      expect(delegate.onEnd).not.toHaveBeenCalled();
    });

    it('exports unprocessed message spans when rate is 1', () => {
      const delegate = mockDeep<SpanProcessor>();
      const processor = new FilteringSpanProcessor({ delegate, unprocessedRate: 1 });

      const span = createMockSpan({ attributes: { 'discord.message.processed': false } });
      processor.onEnd(span);

      expect(delegate.onEnd).toHaveBeenCalledWith(span);
    });
  });

  describe('success spans are sampled at successRate', () => {
    it('drops success spans when rate is 0', () => {
      const delegate = mockDeep<SpanProcessor>();
      const processor = new FilteringSpanProcessor({ delegate, successRate: 0 });

      const span = createMockSpan({});
      processor.onEnd(span);

      expect(delegate.onEnd).not.toHaveBeenCalled();
    });

    it('exports success spans when rate is 1', () => {
      const delegate = mockDeep<SpanProcessor>();
      const processor = new FilteringSpanProcessor({ delegate, successRate: 1 });

      const span = createMockSpan({});
      processor.onEnd(span);

      expect(delegate.onEnd).toHaveBeenCalledWith(span);
    });
  });

  it('delegates onStart to the underlying processor', () => {
    const delegate = mockDeep<SpanProcessor>();
    const processor = new FilteringSpanProcessor({ delegate });

    const span = {} as never;
    const context = {} as never;
    processor.onStart(span, context);

    expect(delegate.onStart).toHaveBeenCalledWith(span, context);
  });

  it('delegates forceFlush and shutdown', async () => {
    const delegate = mockDeep<SpanProcessor>();
    const processor = new FilteringSpanProcessor({ delegate });

    await processor.forceFlush();
    await processor.shutdown();

    expect(delegate.forceFlush).toHaveBeenCalled();
    expect(delegate.shutdown).toHaveBeenCalled();
  });
});
