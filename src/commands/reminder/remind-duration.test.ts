import { beforeEach, afterEach, vi, it, describe, expect } from 'vitest';
import { addSeconds, getUnixTime, parse } from 'date-fns';
import { execute } from './remind-duration';
import { saveReminder } from './reminder-utils';
import { DAY_MONTH_YEAR_HOUR_MINUTE_FORMAT } from '../../utils/dateUtils';

vi.mock('./reminder-utils');
const mockSaveReminder = vi.mocked(saveReminder);
const replyMock = vi.fn();

const currentDate = parse(
  '11/04/2023 09:00',
  DAY_MONTH_YEAR_HOUR_MINUTE_FORMAT,
  new Date()
);
const message = 'blah';
const userId = 'user_12345';
const guildId = 'guild_12345';
const reminderId = '1';

const mockGetString = (param: string) => {
  switch (param) {
    case 'message':
      return message;

    case 'duration':
      return '1m';

    default:
      return undefined;
  }
};

describe('remind on duration from now', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(currentDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should send error reply if duration is invalid', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      member: {
        user: {
          id: userId,
        },
      },
      guildId,
      options: {
        getString(param: string) {
          if (param === 'duration') {
            return 'invalid duration';
          }
          return mockGetString(param);
        },
      },
    };

    await execute(mockInteraction);

    expect(mockSaveReminder).toHaveBeenCalledTimes(0);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      'Invalid duration. Please specify a duration to get reminded.'
    );
  });

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

  it('should send reply if all options are provided', async () => {
    const unixTime = getUnixTime(addSeconds(currentDate, 60));
    mockSaveReminder.mockResolvedValueOnce({
      success: true,
      data: {
        id: reminderId,
        guildId,
        userId,
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
        getNumber() {
          return 1;
        },
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
