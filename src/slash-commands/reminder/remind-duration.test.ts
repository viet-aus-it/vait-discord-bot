import { addSeconds, getUnixTime, parse } from 'date-fns';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { DAY_MONTH_YEAR_HOUR_MINUTE_FORMAT } from '../../utils/date';
import { execute } from './remind-duration';
import { saveReminder } from './utils';

vi.mock('./utils');
const mockSaveReminder = vi.mocked(saveReminder);

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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  chatInputCommandInteractionTest('should send error reply if duration is invalid', async ({ interaction }) => {
    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    interaction.options.getString.mockImplementationOnce((param: string) => {
      if (param === 'duration') {
        return 'invalid duration';
      }
      return mockGetString(param);
    });

    await execute(interaction);

    expect(mockSaveReminder).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Invalid duration. Please specify a duration to get reminded.');
  });

  chatInputCommandInteractionTest('should send error reply if it cannot save reminder', async ({ interaction }) => {
    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    mockSaveReminder.mockRejectedValueOnce(new Error('Synthetic Error'));
    interaction.options.getString.mockImplementation(mockGetString);

    await execute(interaction);

    expect(mockSaveReminder).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Cannot save reminder for <@${userId}>. Please try again later.`);
  });

  chatInputCommandInteractionTest('should send reply if all options are provided', async ({ interaction }) => {
    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    const unixTime = getUnixTime(addSeconds(currentDate, 60));
    mockSaveReminder.mockResolvedValueOnce({
      id: reminderId,
      guildId,
      userId,
      onTimestamp: unixTime,
      message,
    });
    interaction.options.getString.mockImplementation(mockGetString);

    await execute(interaction);

    expect(mockSaveReminder).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`New Reminder for <@${userId}> set on <t:${unixTime}> with the message: "${message}".`);
  });
});
