import { vi, it, describe, expect } from 'vitest';
import { getYear } from 'date-fns';
import { execute } from './list';
import { getUserReminders } from './reminder-utils';
import { convertDateToEpoch } from '../../utils/dateUtils';

vi.mock('./reminder-utils');
const mockGetReminders = vi.mocked(getUserReminders);
const replyMock = vi.fn();

const dateString = `31/12/${getYear(new Date())} 00:00`;
const message = 'blah';
const userId = 'user_12345';
const guildId = 'guild_12345';
const reminderId = '1';

const mockGetString = (_param: string, required?: boolean) => {
  return required ? undefined : null;
};

describe('List reminders', () => {
  it('Should reply with error if reminders cannot be retrieved', async () => {
    mockGetReminders.mockRejectedValueOnce(new Error('Synthetic error'));
    const mockInteraction: any = {
      reply: replyMock,
      member: {
        user: {
          id: userId,
        },
      },
      guildId,
      options: {
        getString: mockGetString,
      },
    };

    await execute(mockInteraction);

    expect(mockGetReminders).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      'There is some error retrieving your reminders. Please try again later.'
    );
  });

  it('Should reply with empty message if there is no reminder set up', async () => {
    mockGetReminders.mockResolvedValueOnce([]);
    const mockInteraction: any = {
      reply: replyMock,
      member: {
        user: {
          id: userId,
        },
      },
      guildId,
      options: {
        getString: mockGetString,
      },
    };

    await execute(mockInteraction);
    expect(mockGetReminders).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
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
    const mockInteraction: any = {
      reply: replyMock,
      member: {
        user: {
          id: userId,
        },
      },
      guildId,
      options: {
        getString: mockGetString,
      },
    };

    await execute(mockInteraction);
    expect(mockGetReminders).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      `Here are your reminders:

id: ${reminderId}
message: ${message}
on: <t:${unixTime}>
`
    );
  });
});
