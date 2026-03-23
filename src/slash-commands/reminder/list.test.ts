import { getUnixTime } from 'date-fns';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedReminder, seedUser } from '../../../test/fixtures/db-seed';
import { execute } from './list';
import * as utils from './utils';

const message = 'blah';
const userId = 'user_12345';

describe('List reminders', () => {
  chatInputCommandInteractionTest('Should reply with error if reminders cannot be retrieved', async ({ interaction }) => {
    interaction.member!.user.id = userId;
    vi.spyOn(utils, 'getUserReminders').mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('There is some error retrieving your reminders. Please try again later.');
  });

  chatInputCommandInteractionTest('Should reply with empty message if there is no reminder set up', async ({ interaction }) => {
    interaction.member!.user.id = userId;

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("You currently don't have any reminder set up.");
  });

  chatInputCommandInteractionTest('Should reply with list of reminders if exists', async ({ interaction }) => {
    await seedUser(userId);
    const futureTimestamp = getUnixTime(new Date()) + 86400;
    const reminder = await seedReminder({ userId, guildId: interaction.guildId!, message, onTimestamp: futureTimestamp });

    interaction.member!.user.id = userId;

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `Here are your reminders:

id: ${reminder.id}
message: ${message}
on: <t:${futureTimestamp}>
`
    );
  });
});
