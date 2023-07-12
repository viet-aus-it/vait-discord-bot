import { vi, it, describe, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import {
  ChatInputCommandInteraction,
  TextChannel,
  ChannelType,
} from 'discord.js';
import { addAutobumpThread } from './util';
import { addAutobumpThreadCommand } from './add-thread';

vi.mock('./util');
const mockAddAutobumpThread = vi.mocked(addAutobumpThread);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();
const channelId = 'channel_1234';
const threadId = 'thread_1234';

describe('Add autobump thread', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should reply with error if the given channel is not a thread', async () => {
    mockInteraction.options.getChannel.mockReturnValueOnce({
      id: channelId,
      type: ChannelType.GuildText,
    } as unknown as TextChannel);

    await addAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith(
      'ERROR: The channel in the input is not a thread.'
    );
    expect(mockAddAutobumpThread).not.toBeCalled();
  });

  it('Should reply with error if it cannot be saved into the database', async () => {
    mockInteraction.options.getChannel.mockReturnValueOnce({
      id: threadId,
      type: ChannelType.PublicThread,
    } as unknown as TextChannel);
    mockAddAutobumpThread.mockRejectedValueOnce(new Error('Synthetic Error'));

    await addAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith(
      'ERROR: Cannot save this thread to be autobumped for this server. Please try again.'
    );
    expect(mockAddAutobumpThread).toBeCalled();
  });

  it('Should reply with success message if it can be saved into the database', async () => {
    mockInteraction.options.getChannel.mockReturnValueOnce({
      id: threadId,
      type: ChannelType.PublicThread,
    } as unknown as TextChannel);
    mockAddAutobumpThread.mockResolvedValueOnce([threadId]);

    await addAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith(
      `Successfully saved setting. Thread <#${threadId}> will be autobumped.`
    );
    expect(mockAddAutobumpThread).toBeCalled();
  });
});
