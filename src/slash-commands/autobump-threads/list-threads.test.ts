import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { listAutobumpThreadsCommand } from './list-threads';
import { listThreadsByGuild } from './utils';

vi.mock('./utils');
const mockListAutobumpThread = vi.mocked(listThreadsByGuild);
const threadId = 'thread_1234';

describe('List autobump threads', () => {
  chatInputCommandInteractionTest('Should reply with error if the server settings cannot be retrieved', async ({ interaction }) => {
    mockListAutobumpThread.mockRejectedValueOnce(new Error('Synthetic Error'));

    await listAutobumpThreadsCommand(interaction);

    expect(mockListAutobumpThread).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("ERROR: Cannot get list of threads from the database, maybe the server threads aren't setup yet?");
  });

  chatInputCommandInteractionTest('Should reply with empty message if no autobump thread has been set', async ({ interaction }) => {
    mockListAutobumpThread.mockResolvedValueOnce([]);

    await listAutobumpThreadsCommand(interaction);

    expect(mockListAutobumpThread).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('ERROR: No threads have been setup for autobumping in this server');
  });

  chatInputCommandInteractionTest('Should reply with list of autobump thread if it has been set', async ({ interaction }) => {
    mockListAutobumpThread.mockResolvedValueOnce([threadId]);

    await listAutobumpThreadsCommand(interaction);

    expect(mockListAutobumpThread).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `Here is the threads to be autobumped in this server:
- <#${threadId}>
`
    );
  });
});
