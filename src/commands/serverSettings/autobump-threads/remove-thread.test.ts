import { vi, it, describe, expect } from 'vitest';
import { removeAutobumpThread } from './util';
import { removeAutobumpThreadCommand } from './remove-thread';

vi.mock('./util');
const mockRemoveAutobumpThread = vi.mocked(removeAutobumpThread);
const replyMock = vi.fn();
const guildId = 'guild_1234';
const threadId = 'thread_1234';

describe('Add autobump thread', () => {
  it('Should reply with error if it cannot be saved into the database', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      guildId,
      options: {
        getChannel() {
          return {
            id: threadId,
          };
        },
      },
    };
    mockRemoveAutobumpThread.mockResolvedValueOnce({
      success: false,
      error: new Error('Synthetic Error'),
    });

    await removeAutobumpThreadCommand(mockInteraction);
    expect(replyMock).toBeCalledWith(
      'ERROR: Cannot remove this thread from the bump list for this server. Please try again.'
    );
    expect(mockRemoveAutobumpThread).toBeCalled();
  });

  it('Should reply with success message if it can be saved into the database', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      guildId,
      options: {
        getChannel() {
          return {
            id: threadId,
          };
        },
      },
    };
    mockRemoveAutobumpThread.mockResolvedValueOnce({
      success: true,
      data: [threadId],
    });

    await removeAutobumpThreadCommand(mockInteraction);
    expect(replyMock).toBeCalledWith(
      `Successfully saved setting. Thread <#${threadId}> will not be bumped.`
    );
    expect(mockRemoveAutobumpThread).toBeCalled();
  });
});
