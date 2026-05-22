import { afterEach, describe, expect, vi } from 'vitest';

import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { setHoneypotChannelId } from '../../utils/honeypot-handler';
import { execute } from './set-honeypot-channel';
import * as utils from './utils';

vi.mock('../../utils/honeypot-handler');
const mockSetHoneypotChannelId = vi.mocked(setHoneypotChannelId);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Set honeypot channel', () => {
  chatInputCommandInteractionTest('Should be able to set channel and reply', async ({ interaction, channel }) => {
    interaction.options.getChannel.mockReturnValueOnce(channel);

    await execute(interaction);

    expect(mockSetHoneypotChannelId).toHaveBeenCalledWith(interaction.guildId, channel.id);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Successfully saved setting. Honeypot channel set to <#${channel.id}>`);
  });

  chatInputCommandInteractionTest('Should reply with error if it cannot set the channel', async ({ interaction, channel }) => {
    vi.spyOn(utils, 'setHoneypotChannel').mockRejectedValueOnce(new Error('Synthetic Error'));
    interaction.options.getChannel.mockReturnValueOnce(channel);

    await execute(interaction);

    expect(mockSetHoneypotChannelId).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Cannot save this honeypot channel for this server. Please try again.');
  });
});
