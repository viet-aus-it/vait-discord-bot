import { ChannelType, type ChatInputCommandInteraction, type PublicThreadChannel, type TextChannel } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { addAutobumpThreadCommand } from './add-thread';

const mockInteraction = mockDeep<ChatInputCommandInteraction>();
const threadId = 'thread_1234';
const guildId = '1234';

describe('Add autobump thread', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should reply with error if the given channel is not a thread', async () => {
    const mockChannel = mockDeep<TextChannel>();
    mockChannel.id = 'channel_1234';
    mockChannel.type = ChannelType.GuildText;
    mockInteraction.options.getChannel.mockReturnValueOnce(mockChannel);

    await addAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith(`ERROR: The channel <#${mockChannel.id}> is not a thread.`);
  });

  it('Should reply with success message if it can be saved into the database', async () => {
    const mockChannel = mockDeep<PublicThreadChannel>();
    mockChannel.id = threadId;
    mockChannel.type = ChannelType.PublicThread;
    mockInteraction.guildId = guildId;
    mockInteraction.options.getChannel.mockReturnValueOnce(mockChannel);

    await addAutobumpThreadCommand(mockInteraction);
    expect(mockInteraction.reply).toBeCalledWith(`Successfully saved setting. Thread <#${threadId}> will be autobumped.`);
  });
});
