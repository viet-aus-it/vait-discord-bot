import { vi, it, describe, expect } from 'vitest';
import { getYear } from 'date-fns';
import { execute } from './remind-on-date';
import { saveReminder } from './reminder-utils';
import { convertDateToEpoch } from '../../utils/dateUtils';

vi.mock('./reminder-utils');
const mockSaveReminder = vi.mocked(saveReminder);
const replyMock = vi.fn();

const dateString = `31/12/${getYear(new Date())} 00:00`;
const message = 'blah';
const userId = 'user_12345';
const guildId = 'guild_12345';
const reminderId = '1';

const mockGetString = (param: string, required?: boolean) => {
  switch (param) {
    case 'date':
      return dateString;
    case 'message':
      return message;
    case 'timezone':
      return required ? undefined : null;
  }
};

describe('remind on date', () => {
  it('should send error reply if it cannot save reminder', async () => {
    mockSaveReminder.mockResolvedValueOnce({
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

    expect(mockSaveReminder).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      `Cannot save reminder for <@${userId}>. Please try again later.`
    );
  });

  it('should send reply if it can save reminder', async () => {
    const unixTime = convertDateToEpoch(dateString);
    mockSaveReminder.mockResolvedValueOnce({
      success: true,
      data: {
        id: reminderId,
        userId,
        guildId,
        onTimestamp: unixTime,
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

    expect(mockSaveReminder).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      `New Reminder for <@${userId}> set on <t:${unixTime}> with the message: "${message}".`
    );
  });
});
