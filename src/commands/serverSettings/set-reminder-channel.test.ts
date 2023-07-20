import { vi, it, describe, expect, beforeEach } from 'vitest';
import { mockReset, mockDeep } from 'vitest-mock-extended';
import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { execute } from './set-reminder-channel';
import { setReminderChannel } from './server-utils';

vi.mock('./server-utils');
const mockSetReminderChannel = vi.mocked(setReminderChannel);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();
const channelId = 'channel_12345';

describe('Set reminder channel', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should reply with error if it cannot set the channel', async () => {
    mockSetReminderChannel.mockRejectedValueOnce(new Error('Synthetic Error'));
    mockInteraction.options.getChannel.mockReturnValueOnce({
      id: channelId,
    } as TextChannel);

    await execute(mockInteraction);

    expect(mockSetReminderChannel).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      'Cannot save this reminder channel for this server. Please try again.'
    );
  });

  it('Should be able to set channel and reply', async () => {
    mockSetReminderChannel.mockResolvedValueOnce(channelId);
    mockInteraction.options.getChannel.mockReturnValueOnce({
      id: channelId,
    } as TextChannel);

    await execute(mockInteraction);

    expect(mockSetReminderChannel).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `Sucessfully saved setting. Reminders will be broadcasted in <#${channelId}>`
    );
  });
});
