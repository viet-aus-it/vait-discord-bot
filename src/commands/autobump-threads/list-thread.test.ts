import { vi, it, describe, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { ChatInputCommandInteraction } from 'discord.js';
import { listThreadsByGuild } from './util';
import { listAutobumpThreadsCommand } from './list-threads';

vi.mock('./util');
const mockListAutobumpThread = vi.mocked(listThreadsByGuild);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();
const threadId = 'thread_1234';

describe('List autobump threads', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should reply with error if the server settings cannot be retrieved', async () => {
    mockListAutobumpThread.mockRejectedValueOnce(new Error('Synthetic Error'));

    await listAutobumpThreadsCommand(mockInteraction);

    expect(mockListAutobumpThread).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      "ERROR: Cannot get list of threads from the database, maybe the server threads aren't setup yet?"
    );
  });

  it('Should reply with empty message if no autobump thread has been set', async () => {
    mockListAutobumpThread.mockResolvedValueOnce([]);

    await listAutobumpThreadsCommand(mockInteraction);

    expect(mockListAutobumpThread).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      'No threads have been setup for autobumping in this server'
    );
  });

  it('Should reply with list of autobump thread if it has been set', async () => {
    mockListAutobumpThread.mockResolvedValueOnce([threadId]);

    await listAutobumpThreadsCommand(mockInteraction);

    expect(mockListAutobumpThread).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `Here is the threads to be autobumped in this server:
- <#${threadId}>
`
    );
  });
});
