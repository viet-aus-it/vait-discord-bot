import { vi, it, describe, expect } from 'vitest';
import { removeReminder } from './reminder-utils';
import { execute } from './remove';

vi.mock('./reminder-utils');
const mockRemoveReminder = vi.mocked(removeReminder);
const replyMock = vi.fn();

const userId = 'user_12345';
const guildId = 'guild_12345';
const reminderId = '1';

const mockGetString = () => reminderId;

describe('Remove Reminder', () => {
  it('Should reply with error if reminders cannot be removed', async () => {
    mockRemoveReminder.mockRejectedValueOnce(new Error('Synthetic error'));
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

    expect(mockRemoveReminder).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      `Cannot delete reminder id ${reminderId}. Please try again later.`
    );
  });

  it('Should reply if reminder can be removed', async () => {
    mockRemoveReminder.mockResolvedValueOnce();
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

    expect(mockRemoveReminder).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      `Reminder ${reminderId} has been deleted.`
    );
  });
});
