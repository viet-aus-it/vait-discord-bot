import { getUnixTime, getYear } from 'date-fns';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedReminder, seedUser } from '../../../test/fixtures/db-seed';
import { convertDateToEpoch } from '../../utils/date';
import { execute } from './update';
import * as utils from './utils';

const dateString = `31/12/${getYear(new Date())} 00:00`;
const message = 'blah';
const userId = 'user_12345';
const guildId = 'guild_12345';

const mockGetString = (param: string, _required?: boolean) => {
  switch (param) {
    case 'id':
      return 'reminder-id';
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
      return param === 'id' ? 'reminder-id' : null;
    });

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Nothing to update. Skipping...');
  });

  chatInputCommandInteractionTest('Should send error reply if it cannot update reminder', async ({ interaction }) => {
    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    vi.spyOn(utils, 'updateReminder').mockRejectedValueOnce(new Error('Synthetic Error'));
    interaction.options.getString.mockImplementation(mockGetString);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Cannot update reminder for <@${userId}> and reminder id reminder-id. Please try again later.`);
  });

  chatInputCommandInteractionTest('Should send reply with default timezone if no timezone given', async ({ interaction }) => {
    await seedUser(userId);
    const futureTimestamp = getUnixTime(new Date()) + 86400;
    const reminder = await seedReminder({ userId, guildId, message: 'old message', onTimestamp: futureTimestamp });

    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    const unixTimestamp = convertDateToEpoch(dateString);

    const mockGetStringWithReminderId = (param: string, _required?: boolean) => {
      switch (param) {
        case 'id':
          return reminder.id;
        case 'date':
          return dateString;
        case 'message':
          return message;
        default:
          return null;
      }
    };
    interaction.options.getString.mockImplementation(mockGetStringWithReminderId);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `Reminder ${reminder.id} has been updated to remind on <t:${unixTimestamp}> with the message: "${message}".`
    );
  });
});
