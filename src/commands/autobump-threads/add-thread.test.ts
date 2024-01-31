import { ChannelType, ChatInputCommandInteraction, PublicThreadChannel, TextChannel } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { addAutobumpThreadCommand } from './add-thread';
import { addAutobumpThread } from './util';

vi.mock('./util');
const mockAddAutobumpThread = vi.mocked(addAutobumpThread);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();
const threadId = 'thread_1234';

describe('Add autobump thread', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should reply with error if the given channel is not a thread', async () => {
    const mockChannel = mockDeep<TextChannel>();
    mockChannel.id = 'channel_1234';
    mockInteraction.options.getChannel.mockReturnValueOnce(mockChannel);

    await addAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith(`ERROR: The channel <#${mockChannel.id}> is not a thread.`);
    expect(mockAddAutobumpThread).not.toBeCalled();
  });

  it('Should reply with error if it cannot be saved into the database', async () => {
    const mockChannel = mockDeep<PublicThreadChannel>();
    mockChannel.id = threadId;
    mockChannel.type = ChannelType.PublicThread;
    mockInteraction.options.getChannel.mockReturnValueOnce(mockChannel);
    mockAddAutobumpThread.mockRejectedValueOnce(new Error('Synthetic Error'));

    await addAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith('ERROR: Cannot save this thread to be autobumped for this server. Please try again.');
    expect(mockAddAutobumpThread).toBeCalled();
  });

  it('Should reply with success message if it can be saved into the database', async () => {
    const mockChannel = mockDeep<PublicThreadChannel>();
    mockChannel.id = threadId;
    mockChannel.type = ChannelType.PublicThread;
    mockInteraction.options.getChannel.mockReturnValueOnce(mockChannel);
    mockAddAutobumpThread.mockResolvedValueOnce([threadId]);

    await addAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith(`Successfully saved setting. Thread <#${threadId}> will be autobumped.`);
    expect(mockAddAutobumpThread).toBeCalled();
  });
});
