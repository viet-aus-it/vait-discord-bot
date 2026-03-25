import { SpanStatusCode } from '@opentelemetry/api';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { describe, expect, it, vi } from 'vitest';
import { FilteringSpanProcessor } from './filtering-span-processor';

const createMockSpan = (overrides: { attributes?: Record<string, unknown>; statusCode?: SpanStatusCode; traceId?: string }): ReadableSpan =>
  ({
    attributes: overrides.attributes ?? {},
    status: { code: overrides.statusCode ?? SpanStatusCode.UNSET },
    spanContext: () => ({
      traceId: overrides.traceId ?? '00000000000000000000000000000000',
      spanId: '0000000000000000',
      traceFlags: 1,
    }),
  }) as unknown as ReadableSpan;

const createMockDelegate = () => ({
  onStart: vi.fn(),
  onEnd: vi.fn(),
  forceFlush: vi.fn().mockResolvedValue(undefined),
  shutdown: vi.fn().mockResolvedValue(undefined),
});

describe('FilteringSpanProcessor', () => {
  describe('error spans are always exported', () => {
    it('exports spans with error attribute', () => {
      const delegate = createMockDelegate();
      const processor = new FilteringSpanProcessor({ delegate, successRate: 0 });

      const span = createMockSpan({ attributes: { error: true } });
      processor.onEnd(span);

      expect(delegate.onEnd).toHaveBeenCalledWith(span);
    });

    it('exports spans with ERROR status code', () => {
      const delegate = createMockDelegate();
      const processor = new FilteringSpanProcessor({ delegate, successRate: 0 });

      const span = createMockSpan({ statusCode: SpanStatusCode.ERROR });
      processor.onEnd(span);

      expect(delegate.onEnd).toHaveBeenCalledWith(span);
    });
  });

  describe('unprocessed messages are sampled at unprocessedRate', () => {
    it('drops unprocessed message spans when rate is 0', () => {
      const delegate = createMockDelegate();
      const processor = new FilteringSpanProcessor({ delegate, unprocessedRate: 0 });

      const span = createMockSpan({ attributes: { 'message.processed': false } });
      processor.onEnd(span);

      expect(delegate.onEnd).not.toHaveBeenCalled();
    });

    it('exports unprocessed message spans when rate is 1', () => {
      const delegate = createMockDelegate();
      const processor = new FilteringSpanProcessor({ delegate, unprocessedRate: 1 });

      const span = createMockSpan({ attributes: { 'message.processed': false } });
      processor.onEnd(span);

      expect(delegate.onEnd).toHaveBeenCalledWith(span);
    });
  });

  describe('success spans are sampled at successRate', () => {
    it('drops success spans when rate is 0', () => {
      const delegate = createMockDelegate();
      const processor = new FilteringSpanProcessor({ delegate, successRate: 0 });

      const span = createMockSpan({});
      processor.onEnd(span);

      expect(delegate.onEnd).not.toHaveBeenCalled();
    });

    it('exports success spans when rate is 1', () => {
      const delegate = createMockDelegate();
      const processor = new FilteringSpanProcessor({ delegate, successRate: 1 });

      const span = createMockSpan({});
      processor.onEnd(span);

      expect(delegate.onEnd).toHaveBeenCalledWith(span);
    });
  });

  it('delegates onStart to the underlying processor', () => {
    const delegate = createMockDelegate();
    const processor = new FilteringSpanProcessor({ delegate });

    const span = {} as never;
    const context = {} as never;
    processor.onStart(span, context);

    expect(delegate.onStart).toHaveBeenCalledWith(span, context);
  });

  it('delegates forceFlush and shutdown', async () => {
    const delegate = createMockDelegate();
    const processor = new FilteringSpanProcessor({ delegate });

    await processor.forceFlush();
    await processor.shutdown();

    expect(delegate.forceFlush).toHaveBeenCalled();
    expect(delegate.shutdown).toHaveBeenCalled();
  });
});
