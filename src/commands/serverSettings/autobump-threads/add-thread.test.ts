import { vi, it, describe, expect } from 'vitest';
import { addAutobumpThread } from './util';
import { addAutobumpThreadCommand } from './add-thread';
import { ChannelType } from 'discord.js';

vi.mock('./util');
const mockAddAutobumpThread = vi.mocked(addAutobumpThread);
const replyMock = vi.fn();
const guildId = 'guild_1234';
const channelId = 'channel_1234';
const threadId = 'thread_1234';

describe('Add autobump thread', () => {
  it('Should reply with error if the given channel is not a thread', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      guildId,
      options: {
        getChannel() {
          return {
            id: channelId,
            type: ChannelType.GuildText,
          };
        },
      },
    };

    await addAutobumpThreadCommand(mockInteraction);
    expect(replyMock).toBeCalledWith(
      'ERROR: The channel in the input is not a thread.'
    );
    expect(mockAddAutobumpThread).not.toBeCalled();
  });

  it('Should reply with error if it cannot be saved into the database', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      guildId,
      options: {
        getChannel() {
          return {
            id: threadId,
            type: ChannelType.PublicThread,
          };
        },
      },
    };
    mockAddAutobumpThread.mockResolvedValueOnce({
      success: false,
      error: new Error('Synthetic Error'),
    });

    await addAutobumpThreadCommand(mockInteraction);
    expect(replyMock).toBeCalledWith(
      'ERROR: Cannot save this thread to be autobumped for this server. Please try again.'
    );
    expect(mockAddAutobumpThread).toBeCalled();
  });

  it('Should reply with success message if it can be saved into the database', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      guildId,
      options: {
        getChannel() {
          return {
            id: threadId,
            type: ChannelType.PublicThread,
          };
        },
      },
    };
    mockAddAutobumpThread.mockResolvedValueOnce({
      success: true,
      data: [threadId],
    });

    await addAutobumpThreadCommand(mockInteraction);
    expect(replyMock).toBeCalledWith(
      `Successfully saved setting. Thread <#${threadId}> will be autobumped.`
    );
    expect(mockAddAutobumpThread).toBeCalled();
  });
});
