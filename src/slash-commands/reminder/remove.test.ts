import { getUnixTime } from 'date-fns';
import { describe, expect, vi } from 'vitest';

import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedReminder, seedUser } from '../../../test/fixtures/db-seed';
import { execute } from './remove';
import * as utils from './utils';

describe('Remove Reminder', () => {
  chatInputCommandInteractionTest('Should reply with error if reminders cannot be removed', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('some-id');
    vi.spyOn(utils, 'removeReminder').mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Cannot delete reminder id some-id. Please try again later.');
  });

  chatInputCommandInteractionTest('Should reply if reminder can be removed', async ({ interaction }) => {
    const userId = 'user_12345';
    await seedUser(userId);
    const reminder = await seedReminder({ userId, guildId: interaction.guildId!, message: 'test', onTimestamp: getUnixTime(new Date()) + 86400 });

    interaction.member!.user.id = userId;
    interaction.options.getString.mockReturnValueOnce(reminder.id);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Reminder ${reminder.id} has been deleted.`);
  });
});
