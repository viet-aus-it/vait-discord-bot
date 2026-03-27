import type { Span } from '@opentelemetry/api';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { ATTR_ERROR_TYPE } from '@opentelemetry/semantic-conventions';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { recordSpanError, setSpanAttributes } from './tracer';

describe('recordSpanError', () => {
  afterEach(() => vi.restoreAllMocks());

  it('is a no-op when there is no active span', () => {
    vi.spyOn(trace, 'getActiveSpan').mockReturnValue(undefined);
    expect(() => recordSpanError(new Error('test'), 'err-test')).not.toThrow();
  });

  it('sets status, records exception, and sets error.type on the active span', () => {
    const mockSpan = mockDeep<Span>();
    vi.spyOn(trace, 'getActiveSpan').mockReturnValue(mockSpan);

    const error = new Error('something broke');
    recordSpanError(error, 'err-command-failed');

    expect(mockSpan.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
      message: 'Error: something broke',
    });
    expect(mockSpan.recordException).toHaveBeenCalledWith(error);
    expect(mockSpan.setAttribute).toHaveBeenCalledWith(ATTR_ERROR_TYPE, 'err-command-failed');
  });

  it('wraps non-Error values in an Error for recordException', () => {
    const mockSpan = mockDeep<Span>();
    vi.spyOn(trace, 'getActiveSpan').mockReturnValue(mockSpan);

    recordSpanError('string error', 'err-string');

    expect(mockSpan.recordException).toHaveBeenCalledWith(new Error('string error'));
  });
});

describe('setSpanAttributes', () => {
  afterEach(() => vi.restoreAllMocks());

  it('is a no-op when there is no active span', () => {
    vi.spyOn(trace, 'getActiveSpan').mockReturnValue(undefined);
    expect(() => setSpanAttributes({ 'bot.test': 'value' })).not.toThrow();
  });

  it('sets all provided attributes on the active span', () => {
    const mockSpan = mockDeep<Span>();
    vi.spyOn(trace, 'getActiveSpan').mockReturnValue(mockSpan);

    setSpanAttributes({
      'bot.test.string': 'hello',
      'bot.test.number': 42,
      'bot.test.boolean': true,
    });

    expect(mockSpan.setAttribute).toHaveBeenCalledWith('bot.test.string', 'hello');
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('bot.test.number', 42);
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('bot.test.boolean', true);
  });
});
