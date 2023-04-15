import { vi, it, describe, expect } from 'vitest';
import { execute } from './set-reminder-channel';
import { setReminderChannel } from './server-utils';

vi.mock('./server-utils');
const mockSetReminderChannel = vi.mocked(setReminderChannel);
const mockReply = vi.fn();
const channelId = 'channel_12345';
const guildId = 'guild_12345';

describe('Set reminder channel', () => {
  it('Should reply with error if it cannot set the channel', async () => {
    const error = new Error('Synthetic Error');
    mockSetReminderChannel.mockResolvedValueOnce({
      success: false,
      error,
    });
    const mockInteraction: any = {
      reply: mockReply,
      guildId,
      options: {
        getChannel() {
          return {
            id: channelId,
          };
        },
      },
    };

    await execute(mockInteraction);

    expect(mockSetReminderChannel).toHaveBeenCalledOnce();
    expect(mockReply).toHaveBeenCalledOnce();
    expect(mockReply).toHaveBeenCalledWith(
      `Cannot save this reminder channel for this server. Please try again.`
    );
  });

  it('Should be able to set channel and reply', async () => {
    mockSetReminderChannel.mockResolvedValueOnce({
      success: true,
      data: channelId,
    });
    const mockInteraction: any = {
      reply: mockReply,
      guildId,
      options: {
        getChannel() {
          return {
            id: channelId,
          };
        },
      },
    };

    await execute(mockInteraction);

    expect(mockSetReminderChannel).toHaveBeenCalledOnce();
    expect(mockReply).toHaveBeenCalledOnce();
    expect(mockReply).toHaveBeenCalledWith(
      `Sucessfully saved setting. Reminders will be broadcasted in <#${channelId}>`
    );
  });
});
