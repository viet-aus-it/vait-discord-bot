import { getYear } from 'date-fns';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { convertDateToEpoch } from '../../utils/date';
import { execute } from './list';
import { getUserReminders } from './utils';

vi.mock('./utils');
const mockGetReminders = vi.mocked(getUserReminders);

const dateString = `31/12/${getYear(new Date())} 00:00`;
const message = 'blah';
const userId = 'user_12345';
const reminderId = '1';

describe('List reminders', () => {
  chatInputCommandInteractionTest('Should reply with error if reminders cannot be retrieved', async ({ interaction }) => {
    interaction.member!.user.id = userId;
    mockGetReminders.mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(mockGetReminders).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('There is some error retrieving your reminders. Please try again later.');
  });

  chatInputCommandInteractionTest('Should reply with empty message if there is no reminder set up', async ({ interaction }) => {
    interaction.member!.user.id = userId;
    mockGetReminders.mockResolvedValueOnce([]);

    await execute(interaction);

    expect(mockGetReminders).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("You currently don't have any reminder set up.");
  });

  chatInputCommandInteractionTest('Should reply with list of reminders if exists', async ({ interaction }) => {
    interaction.member!.user.id = userId;
    const unixTime = convertDateToEpoch(dateString);
    mockGetReminders.mockResolvedValueOnce([
      {
        id: reminderId,
        userId,
        guildId: interaction.guildId!,
        message,
        onTimestamp: unixTime,
      },
    ]);

    await execute(interaction);

    expect(mockGetReminders).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `Here are your reminders:

id: ${reminderId}
message: ${message}
on: <t:${unixTime}>
`
    );
  });
});
