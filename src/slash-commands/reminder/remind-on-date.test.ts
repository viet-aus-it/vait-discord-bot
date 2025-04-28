import { getYear } from 'date-fns';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { convertDateToEpoch } from '../../utils/date';
import { execute } from './remind-on-date';
import { saveReminder } from './utils';

vi.mock('./utils');
const mockSaveReminder = vi.mocked(saveReminder);

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
  chatInputCommandInteractionTest('should send error reply if it cannot save reminder', async ({ interaction }) => {
    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    interaction.options.getString.mockImplementation(mockGetString);
    mockSaveReminder.mockRejectedValueOnce(new Error('Synthetic Error'));

    await execute(interaction);

    expect(mockSaveReminder).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Cannot save reminder for <@${userId}>. Please try again later.`);
  });

  chatInputCommandInteractionTest('should send reply if it can save reminder', async ({ interaction }) => {
    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    interaction.options.getString.mockImplementation(mockGetString);
    const unixTime = convertDateToEpoch(dateString);
    mockSaveReminder.mockResolvedValueOnce({
      id: reminderId,
      userId,
      guildId,
      onTimestamp: unixTime,
      message,
    });

    await execute(interaction);

    expect(mockSaveReminder).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`New Reminder for <@${userId}> set on <t:${unixTime}> with the message: "${message}".`);
  });
});
