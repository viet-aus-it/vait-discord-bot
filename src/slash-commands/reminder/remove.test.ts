import type { ChatInputCommandInteraction } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { execute } from './remove';
import { removeReminder } from './utils';

vi.mock('./utils');
const mockRemoveReminder = vi.mocked(removeReminder);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();

const reminderId = '1';

describe('Remove Reminder', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
    mockInteraction.options.getString.mockReturnValueOnce(reminderId);
  });

  it('Should reply with error if reminders cannot be removed', async () => {
    mockRemoveReminder.mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(mockInteraction);

    expect(mockRemoveReminder).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(`Cannot delete reminder id ${reminderId}. Please try again later.`);
  });

  it('Should reply if reminder can be removed', async () => {
    mockRemoveReminder.mockResolvedValueOnce();

    await execute(mockInteraction);

    expect(mockRemoveReminder).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(`Reminder ${reminderId} has been deleted.`);
  });
});
