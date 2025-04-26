import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './remove';
import { removeReminder } from './utils';

vi.mock('./utils');
const mockRemoveReminder = vi.mocked(removeReminder);

const reminderId = '1';

describe('Remove Reminder', () => {
  chatInputCommandInteractionTest('Should reply with error if reminders cannot be removed', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce(reminderId);
    mockRemoveReminder.mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(mockRemoveReminder).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Cannot delete reminder id ${reminderId}. Please try again later.`);
  });

  chatInputCommandInteractionTest('Should reply if reminder can be removed', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce(reminderId);
    mockRemoveReminder.mockResolvedValueOnce();

    await execute(interaction);

    expect(mockRemoveReminder).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Reminder ${reminderId} has been deleted.`);
  });
});
