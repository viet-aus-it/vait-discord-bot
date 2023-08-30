import { getYear } from 'date-fns';
import { ChatInputCommandInteraction } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { convertDateToEpoch } from '../../utils/dateUtils';
import { execute } from './remind-on-date';
import { saveReminder } from './reminder-utils';

vi.mock('./reminder-utils');
const mockSaveReminder = vi.mocked(saveReminder);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();

const dateString = `31/12/${getYear(new Date())} 00:00`;
const message = 'blah';
const userId = 'user_12345';
const guildId = 'guild_12345';
const reminderId = '1';

const mockGetString = (param: string) => {
  switch (param) {
    case 'date':
      return dateString;
    case 'message':
      return message;
    case 'timezone':
      return null;
    default:
      return null;
  }
};

describe('remind on date', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
    mockInteraction.guildId = guildId;
    mockInteraction.member!.user.id = userId;
    mockInteraction.options.getString.mockImplementationOnce(mockGetString);
  });

  it('should send error reply if it cannot save reminder', async () => {
    mockSaveReminder.mockRejectedValueOnce(new Error('Synthetic Error'));

    await execute(mockInteraction);

    expect(mockSaveReminder).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(`Cannot save reminder for <@${userId}>. Please try again later.`);
  });

  it('should send reply if it can save reminder', async () => {
    const unixTime = convertDateToEpoch(dateString);
    mockSaveReminder.mockResolvedValueOnce({
      id: reminderId,
      userId,
      guildId,
      onTimestamp: unixTime,
      message,
    });

    await execute(mockInteraction);

    expect(mockSaveReminder).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(`New Reminder for <@${userId}> set on <t:${unixTime}> with the message: "${message}".`);
  });
});
