import type { TextChannel } from 'discord.js';
import { describe, expect, vi } from 'vitest';

import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './set-reminder-channel';
import * as utils from './utils';

const channelId = 'channel_12345';

describe('Set reminder channel', () => {
  chatInputCommandInteractionTest('Should reply with error if it cannot set the channel', async ({ interaction }) => {
    vi.spyOn(utils, 'setReminderChannel').mockRejectedValueOnce(new Error('Synthetic Error'));
    interaction.options.getChannel.mockReturnValueOnce({
      id: channelId,
    } as TextChannel);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Cannot save this reminder channel for this server. Please try again.');
  });

  chatInputCommandInteractionTest('Should be able to set channel and reply', async ({ interaction }) => {
    interaction.options.getChannel.mockReturnValueOnce({
      id: channelId,
    } as TextChannel);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Successfully saved setting. Reminders will be broadcasted in <#${channelId}>`);
  });
});
