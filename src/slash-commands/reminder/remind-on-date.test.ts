import { getYear } from 'date-fns';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedUser } from '../../../test/fixtures/db-seed';
import { convertDateToEpoch } from '../../utils/date';
import { execute } from './remind-on-date';
import * as utils from './utils';

const dateString = `31/12/${getYear(new Date())} 00:00`;
const message = 'blah';
const userId = 'user_12345';
const guildId = 'guild_12345';

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
    vi.spyOn(utils, 'saveReminder').mockRejectedValueOnce(new Error('Synthetic Error'));

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Cannot save reminder for <@${userId}>. Please try again later.`);
  });

  chatInputCommandInteractionTest('should send reply if it can save reminder', async ({ interaction }) => {
    await seedUser(userId);

    interaction.guildId = guildId;
    interaction.member!.user.id = userId;
    interaction.options.getString.mockImplementation(mockGetString);
    const unixTime = convertDateToEpoch(dateString);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`New Reminder for <@${userId}> set on <t:${unixTime}> with the message: "${message}".`);
  });
});
