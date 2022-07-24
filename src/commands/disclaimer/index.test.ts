import { vi, it, describe, expect } from 'vitest';
import { getDisclaimer } from '.';

const replyMock = vi.fn();

describe('get disclaimer test', () => {
  it('Should return the disclaimer text', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: vi.fn(() => ''),
      },
    };

    await getDisclaimer(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
  it('Should return the EN disclaimer text', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: vi.fn(() => 'en'),
      },
    };

    await getDisclaimer(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});
