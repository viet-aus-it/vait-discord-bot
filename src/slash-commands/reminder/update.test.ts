import { getYear } from 'date-fns';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { convertDateToEpoch } from '../../utils/date';
import { execute } from './update';
import { updateReminder } from './utils';

vi.mock('./utils');
const mockUpdateReminder = vi.mocked(updateReminder);

const dateString = `31/12/${getYear(new Date())} 00:00`;
const message = 'blah';
const userId = 'user_12345';
const guildId = 'guild_12345';
const reminderId = '1';

const mockGetString = (param: string, _required?: boolean) => {
  switch (param) {
    case 'id':
      return reminderId;
    case 'date':
      return dateString;
    case 'message':
      return message;

    default:
      return null;
  }
};

describe('update reminder', () => {
  chatInputCommandInteractionTest("Should send error reply if there's nothing to update", async ({ interaction }) => {
    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    interaction.options.getString.mockImplementation((param: string) => {
      return param === 'id' ? reminderId : null;
    });

    await execute(interaction);

    expect(mockUpdateReminder).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Nothing to update. Skipping...');
  });

  chatInputCommandInteractionTest('Should send error reply if it cannot update reminder', async ({ interaction }) => {
    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    mockUpdateReminder.mockRejectedValueOnce(new Error('Synthetic Error'));
    interaction.options.getString.mockImplementation(mockGetString);

    await execute(interaction);

    expect(mockUpdateReminder).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Cannot update reminder for <@${userId}> and reminder id ${reminderId}. Please try again later.`);
  });

  chatInputCommandInteractionTest('Should send reply with default timezone if no timezone given', async ({ interaction }) => {
    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    const unixTimestamp = convertDateToEpoch(dateString);
    mockUpdateReminder.mockResolvedValueOnce({
      id: reminderId,
      userId,
      guildId,
      onTimestamp: unixTimestamp,
      message,
    });
    interaction.options.getString.mockImplementation(mockGetString);

    await execute(interaction);

    expect(mockUpdateReminder).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Reminder ${reminderId} has been updated to remind on <t:${unixTimestamp}> with the message: "${message}".`);
  });
});
