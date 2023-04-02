import { vi, it, describe, expect } from 'vitest';
import { pinMessage } from '.';

const replyMock = vi.fn();

describe('pinMessage context menu test', () => {
  it('Should return if interaction is not message context menu command', async () => {
    const mockInteraction: any = {
      isMessageContextMenuCommand: vi.fn(() => false),
      reply: replyMock,
    };

    await pinMessage(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(0);
  });

  it('Should reply skipping if message is already pinned', async () => {
    const mockInteraction: any = {
      isMessageContextMenuCommand: vi.fn(() => true),
      targetMessage: {
        pinned: true,
      },
      reply: replyMock,
    };

    await pinMessage(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      'Message is already pinned. Skipping...'
    );
  });

  it('Should pin the message', async () => {
    const mockInteraction: any = {
      isMessageContextMenuCommand: vi.fn(() => true),
      targetMessage: {
        pinned: false,
        pin: vi.fn(),
      },
      reply: replyMock,
    };

    await pinMessage(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith('Message is now pinned!');
  });
});
