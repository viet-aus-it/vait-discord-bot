import type { TextChannel } from 'discord.js';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './set-honeypot-channel';
import { setHoneypotChannel } from './utils';

vi.mock('./utils');
const mockSetHoneypotChannel = vi.mocked(setHoneypotChannel);
const channelId = 'channel_12345';

describe('Set honeypot channel', () => {
  chatInputCommandInteractionTest('Should reply with error if it cannot set the channel', async ({ interaction }) => {
    mockSetHoneypotChannel.mockRejectedValueOnce(new Error('Synthetic Error'));
    interaction.options.getChannel.mockReturnValueOnce({
      id: channelId,
    } as TextChannel);

    await execute(interaction);

    expect(mockSetHoneypotChannel).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Cannot save this honeypot channel for this server. Please try again.');
  });

  chatInputCommandInteractionTest('Should be able to set channel and reply', async ({ interaction }) => {
    mockSetHoneypotChannel.mockResolvedValueOnce(channelId);
    interaction.options.getChannel.mockReturnValueOnce({
      id: channelId,
    } as TextChannel);

    await execute(interaction);

    expect(mockSetHoneypotChannel).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Successfully saved setting. Honeypot channel set to <#${channelId}>`);
  });
});
