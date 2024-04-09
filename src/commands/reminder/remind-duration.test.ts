import { addSeconds, getUnixTime, parse } from 'date-fns';
import type { ChatInputCommandInteraction } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { DAY_MONTH_YEAR_HOUR_MINUTE_FORMAT } from '../../utils/date-utils';
import { execute } from './remind-duration';
import { saveReminder } from './reminder-utils';

vi.mock('./reminder-utils');
const mockSaveReminder = vi.mocked(saveReminder);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();

const currentDate = parse('11/04/2023 09:00', DAY_MONTH_YEAR_HOUR_MINUTE_FORMAT, new Date());
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
      return null;
  }
};

describe('remind on duration from now', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(currentDate);
    mockReset(mockInteraction);
    mockInteraction.guildId = guildId;
    mockInteraction.member!.user.id = userId;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should send error reply if duration is invalid', async () => {
    mockInteraction.options.getString.mockImplementationOnce((param: string) => {
      if (param === 'duration') {
        return 'invalid duration';
      }
      return mockGetString(param);
    });

    await execute(mockInteraction);

    expect(mockSaveReminder).not.toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('Invalid duration. Please specify a duration to get reminded.');
  });

  it('should send error reply if it cannot save reminder', async () => {
    mockSaveReminder.mockRejectedValueOnce(new Error('Synthetic Error'));
    mockInteraction.options.getString.mockImplementation(mockGetString);

    await execute(mockInteraction);

    expect(mockSaveReminder).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(`Cannot save reminder for <@${userId}>. Please try again later.`);
  });

  it('should send reply if all options are provided', async () => {
    const unixTime = getUnixTime(addSeconds(currentDate, 60));
    mockSaveReminder.mockResolvedValueOnce({
      id: reminderId,
      guildId,
      userId,
      onTimestamp: unixTime,
      message,
    });
    mockInteraction.options.getString.mockImplementation(mockGetString);

    await execute(mockInteraction);

    expect(mockSaveReminder).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(`New Reminder for <@${userId}> set on <t:${unixTime}> with the message: "${message}".`);
  });
});
