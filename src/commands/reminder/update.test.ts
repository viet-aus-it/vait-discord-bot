import { getYear } from 'date-fns';
import type { ChatInputCommandInteraction } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { convertDateToEpoch } from '../../utils/date-utils';
import { execute } from './update';
import { updateReminder } from './utils';

vi.mock('./utils');
const mockUpdateReminder = vi.mocked(updateReminder);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();

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
  beforeEach(() => {
    mockReset(mockInteraction);
    mockInteraction.guildId = guildId;
    mockInteraction.member!.user.id = userId;
  });

  it("Should send error reply if there's nothing to update", async () => {
    mockInteraction.options.getString.mockImplementation((param: string) => {
      return param === 'id' ? reminderId : null;
    });

    await execute(mockInteraction);

    expect(mockUpdateReminder).not.toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('Nothing to update. Skipping...');
  });

  it('Should send error reply if it cannot update reminder', async () => {
    mockUpdateReminder.mockRejectedValueOnce(new Error('Synthetic Error'));
    mockInteraction.options.getString.mockImplementation(mockGetString);

    await execute(mockInteraction);

    expect(mockUpdateReminder).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(`Cannot update reminder for <@${userId}> and reminder id ${reminderId}. Please try again later.`);
  });

  it('Should send reply with default timezone if no timezone given', async () => {
    const unixTimestamp = convertDateToEpoch(dateString);
    mockUpdateReminder.mockResolvedValueOnce({
      id: reminderId,
      userId,
      guildId,
      onTimestamp: unixTimestamp,
      message,
    });
    mockInteraction.options.getString.mockImplementation(mockGetString);

    await execute(mockInteraction);

    expect(mockUpdateReminder).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `Reminder ${reminderId} has been updated to remind on <t:${unixTimestamp}> with the message: "${message}".`
    );
  });
});
