import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { setHoneypotChannelId } from '../../utils/honeypot-handler';
import { execute } from './set-honeypot-channel';
import { setHoneypotChannel } from './utils';

vi.mock('./utils');
vi.mock('../../utils/honeypot-handler');
const mockSetHoneypotChannel = vi.mocked(setHoneypotChannel);
const mockSetHoneypotChannelId = vi.mocked(setHoneypotChannelId);

describe('Set honeypot channel', () => {
  chatInputCommandInteractionTest('Should reply with error if it cannot set the channel', async ({ interaction, channel }) => {
    mockSetHoneypotChannel.mockRejectedValueOnce(new Error('Synthetic Error'));
    interaction.options.getChannel.mockReturnValueOnce(channel);

    await execute(interaction);

    expect(mockSetHoneypotChannel).toHaveBeenCalledOnce();
    expect(mockSetHoneypotChannelId).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Cannot save this honeypot channel for this server. Please try again.');
  });

  chatInputCommandInteractionTest('Should be able to set channel and reply', async ({ interaction, channel }) => {
    mockSetHoneypotChannel.mockResolvedValueOnce(channel.id);
    interaction.options.getChannel.mockReturnValueOnce(channel);

    await execute(interaction);

    expect(mockSetHoneypotChannel).toHaveBeenCalledOnce();
    expect(mockSetHoneypotChannelId).toHaveBeenCalledWith(interaction.guildId, channel.id);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Successfully saved setting. Honeypot channel set to <#${channel.id}>`);
  });
});
