import { ChannelType, type PublicThreadChannel, type TextChannel } from 'discord.js';
import { describe, expect, vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { addAutobumpThreadCommand } from './add-thread';
import { addAutobumpThread } from './utils';

vi.mock('./utils');
const mockAddAutobumpThread = vi.mocked(addAutobumpThread);

const threadId = 'thread_1234';

describe('Add autobump thread', () => {
  chatInputCommandInteractionTest('Should reply with error if the given channel is not a thread', async ({ interaction }) => {
    const mockChannel = mockDeep<TextChannel>();
    mockChannel.id = 'channel_1234';
    mockChannel.type = ChannelType.GuildText;
    mockChannel.guildId = interaction.guildId!;
    interaction.options.getChannel.mockReturnValueOnce(mockChannel);

    await addAutobumpThreadCommand(interaction);
    expect(interaction.reply).toBeCalledWith(`ERROR: The channel <#${mockChannel.id}> is not a thread.`);
  });

  chatInputCommandInteractionTest('Should reply with error if it cannot be saved into the database', async ({ interaction }) => {
    const mockChannel = mockDeep<PublicThreadChannel>();
    mockChannel.id = threadId;
    mockChannel.type = ChannelType.PublicThread;
    interaction.options.getChannel.mockReturnValueOnce(mockChannel);
    mockAddAutobumpThread.mockRejectedValueOnce(new Error('Synthetic Error'));

    await addAutobumpThreadCommand(interaction);
    expect(interaction.reply).toBeCalledWith('ERROR: Cannot save this thread to be autobumped for this server. Please try again.');
    expect(mockAddAutobumpThread).toBeCalled();
  });

  chatInputCommandInteractionTest('Should reply with success message if it can be saved into the database', async ({ interaction }) => {
    const mockChannel = mockDeep<PublicThreadChannel>();
    mockChannel.id = threadId;
    mockChannel.type = ChannelType.PublicThread;
    mockChannel.guildId = interaction.guildId!;
    interaction.options.getChannel.mockReturnValueOnce(mockChannel);
    mockAddAutobumpThread.mockResolvedValueOnce([threadId]);

    await addAutobumpThreadCommand(interaction);
    expect(interaction.reply).toBeCalledWith(`Successfully saved setting. Thread <#${threadId}> will be autobumped.`);
  });
});
