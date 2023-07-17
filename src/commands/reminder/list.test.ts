import { vi, it, describe, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { ChatInputCommandInteraction } from 'discord.js';
import { getYear } from 'date-fns';
import { execute } from './list';
import { getUserReminders } from './reminder-utils';
import { convertDateToEpoch } from '../../utils/dateUtils';

vi.mock('./reminder-utils');
const mockGetReminders = vi.mocked(getUserReminders);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();

const dateString = `31/12/${getYear(new Date())} 00:00`;
const message = 'blah';
const userId = 'user_12345';
const guildId = 'guild_12345';
const reminderId = '1';

describe('List reminders', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
    mockInteraction.guildId = guildId;
    mockInteraction.member!.user.id = userId;
  });

  it('Should reply with error if reminders cannot be retrieved', async () => {
    mockGetReminders.mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(mockInteraction);

    expect(mockGetReminders).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      'There is some error retrieving your reminders. Please try again later.'
    );
  });

  it('Should reply with empty message if there is no reminder set up', async () => {
    mockGetReminders.mockResolvedValueOnce([]);

    await execute(mockInteraction);

    expect(mockGetReminders).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      "You currently don't have any reminder set up."
    );
  });

  it('Should reply with list of reminders if exists', async () => {
    const unixTime = convertDateToEpoch(dateString);
    mockGetReminders.mockResolvedValueOnce([
      {
        id: reminderId,
        userId,
        guildId,
        message,
        onTimestamp: unixTime,
      },
    ]);

    await execute(mockInteraction);

    expect(mockGetReminders).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `Here are your reminders:

id: ${reminderId}
message: ${message}
on: <t:${unixTime}>
`
    );
  });
});
