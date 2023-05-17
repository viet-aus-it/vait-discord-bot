import { vi, it, describe, expect } from 'vitest';
import { listThreadsByGuild } from './util';
import { listAutobumpThreadsCommand } from './list-threads';

vi.mock('./util');
const mockListAutobumpThread = vi.mocked(listThreadsByGuild);
const replyMock = vi.fn();
const guildId = 'guild_1234';
const threadId = 'thread_1234';

describe('List autobump threads', () => {
  it('Should reply with error if the server settings cannot be retrieved', async () => {
    mockListAutobumpThread.mockResolvedValueOnce({
      success: false,
      error: new Error('Synthetic Error'),
    });
    const mockInteraction: any = {
      reply: replyMock,
      guildId,
    };

    await listAutobumpThreadsCommand(mockInteraction);

    expect(mockListAutobumpThread).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      "ERROR: Cannot get list of threads from the database, maybe the server threads aren't setup yet?"
    );
  });

  it('Should reply with empty message if no autobump thread has been set', async () => {
    mockListAutobumpThread.mockResolvedValueOnce({
      success: true,
      data: [],
    });
    const mockInteraction: any = {
      reply: replyMock,
      guildId,
    };

    await listAutobumpThreadsCommand(mockInteraction);

    expect(mockListAutobumpThread).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      'No threads have been setup for autobumping in this server'
    );
  });

  it('Should reply with list of autobump thread if it has been set', async () => {
    mockListAutobumpThread.mockResolvedValueOnce({
      success: true,
      data: [threadId],
    });
    const mockInteraction: any = {
      reply: replyMock,
      guildId,
    };

    await listAutobumpThreadsCommand(mockInteraction);

    expect(mockListAutobumpThread).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      `Here is the threads to be autobumped in this server:
- <#${threadId}>
`
    );
  });
});
