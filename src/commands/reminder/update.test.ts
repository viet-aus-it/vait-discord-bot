import { vi, it, describe, expect } from 'vitest';
import { getYear } from 'date-fns';
import { execute } from './update';
import { updateReminder } from './reminder-utils';
import { convertDateToEpoch } from '../../utils/dateUtils';

vi.mock('./reminder-utils');
const mockUpdateReminder = vi.mocked(updateReminder);
const replyMock = vi.fn();

const dateString = `31/12/${getYear(new Date())} 00:00`;
const message = 'blah';
const userId = 'user_12345';
const guildId = 'guild_12345';
const reminderId = '1';

const mockGetString = (param: string, required?: boolean) => {
  switch (param) {
    case 'id':
      return reminderId;
    case 'date':
      return dateString;
    case 'message':
      return message;
    default:
      return required ? undefined : null;
  }
};

describe('update reminder', () => {
  it("Should send error reply if there's nothing to update", async () => {
    const mockInteraction: any = {
      reply: replyMock,
      member: {
        user: {
          id: userId,
        },
      },
      guildId,
      options: {
        getString: (param: string, required: boolean) => {
          if (param === 'message' || param === 'date') {
            return null;
          }

          return mockGetString(param, required);
        },
      },
    };

    await execute(mockInteraction);

    expect(mockUpdateReminder).toHaveBeenCalledTimes(0);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(`Nothing to update. Skipping...`);
  });

  it('Should send error reply if it cannot update reminder', async () => {
    mockUpdateReminder.mockResolvedValueOnce({
      success: false,
      error: new Error('Synthetic Error'),
    });
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

    expect(mockUpdateReminder).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      `Cannot update reminder for <@${userId}> and reminder id ${reminderId}. Please try again later.`
    );
  });

  it('Should send reply with default timezone if no timezone given', async () => {
    const unixTimestamp = convertDateToEpoch(dateString);
    mockUpdateReminder.mockResolvedValueOnce({
      success: true,
      data: {
        id: reminderId,
        userId,
        guildId,
        onTimestamp: unixTimestamp,
        message,
      },
    });
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

    expect(mockUpdateReminder).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      `Reminder ${reminderId} has been updated to remind on <t:${unixTimestamp}> with the message: "${message}".`
    );
  });
});
