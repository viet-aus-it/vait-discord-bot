import { vi, it, describe, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { ChatInputCommandInteraction, PublicThreadChannel } from 'discord.js';
import { removeAutobumpThread } from './util';
import { removeAutobumpThreadCommand } from './remove-thread';

vi.mock('./util');
const mockRemoveAutobumpThread = vi.mocked(removeAutobumpThread);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();
const mockThread = mockDeep<PublicThreadChannel>();
const threadId = 'thread_1234';

describe('Add autobump thread', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
    mockReset(mockThread);
    mockThread.id = threadId;
  });

  it('Should reply with error if it cannot be saved into the database', async () => {
    mockInteraction.options.getChannel.mockReturnValueOnce(mockThread);
    mockRemoveAutobumpThread.mockRejectedValueOnce(
      new Error('Synthetic Error')
    );

    await removeAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith(
      'ERROR: Cannot remove this thread from the bump list for this server. Please try again.'
    );
    expect(mockRemoveAutobumpThread).toBeCalled();
  });

  it('Should reply with success message if it can be saved into the database', async () => {
    mockInteraction.options.getChannel.mockReturnValueOnce(mockThread);
    mockRemoveAutobumpThread.mockResolvedValueOnce([threadId]);

    await removeAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith(
      `Successfully saved setting. Thread <#${threadId}> will not be bumped.`
    );
    expect(mockRemoveAutobumpThread).toBeCalled();
  });
});
