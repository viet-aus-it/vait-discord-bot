import { describe, expect, vi } from 'vitest';
import { captor } from 'vitest-mock-extended';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './referral-remove';
import { type DeleteReferralCodeInput, deleteReferralCode, type GetReferralCodeByIdInput, getReferralCodeById } from './utils';

vi.mock('./utils');
const mockGetReferralCodeById = vi.mocked(getReferralCodeById);
const mockDeleteReferralCode = vi.mocked(deleteReferralCode);

describe('referral-remove execute', () => {
  chatInputCommandInteractionTest('should return error when referral ID not found', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'nonexistent-id';

    const mockInput = captor<GetReferralCodeByIdInput>();
    mockGetReferralCodeById.mockResolvedValueOnce(null);

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      return null;
    });
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockGetReferralCodeById).toBeCalledWith(mockInput);
    expect(mockInput.value.id).toBe(referralId);
    expect(mockInput.value.userId).toBe(userId);
    expect(mockInput.value.guildId).toBe(guildId);
    expect(interaction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain('No referral found with ID');
    expect(replyInput.value).toContain('/referral list');
  });

  chatInputCommandInteractionTest('should successfully remove referral when found', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'existing-id';
    const existingReferral = {
      id: referralId,
      service: 'powershop',
      code: 'TESTCODE123',
      expiry_date: new Date('2025-12-31'),
      userId,
      guildId,
    };

    const mockGetInput = captor<GetReferralCodeByIdInput>();
    const mockDeleteInput = captor<DeleteReferralCodeInput>();
    mockGetReferralCodeById.mockResolvedValueOnce(existingReferral);
    mockDeleteReferralCode.mockResolvedValueOnce({ count: 1 });

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      return null;
    });
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockGetReferralCodeById).toBeCalledWith(mockGetInput);
    expect(mockGetInput.value.id).toBe(referralId);
    expect(mockGetInput.value.userId).toBe(userId);
    expect(mockGetInput.value.guildId).toBe(guildId);

    expect(mockDeleteReferralCode).toBeCalledWith(mockDeleteInput);
    expect(mockDeleteInput.value.id).toBe(referralId);
    expect(mockDeleteInput.value.userId).toBe(userId);
    expect(mockDeleteInput.value.guildId).toBe(guildId);

    expect(interaction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain('Successfully removed referral code for **powershop**');
    expect(replyInput.value).toContain('`TESTCODE123`');
  });

  chatInputCommandInteractionTest('should return error when delete operation fails', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'existing-id';
    const existingReferral = {
      id: referralId,
      service: 'powershop',
      code: 'TESTCODE123',
      expiry_date: new Date('2025-12-31'),
      userId,
      guildId,
    };

    mockGetReferralCodeById.mockResolvedValueOnce(existingReferral);
    mockDeleteReferralCode.mockResolvedValueOnce({ count: 0 }); // No rows deleted

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toBeCalledWith('Failed to remove referral code. Please check the ID and try again.');
  });

  chatInputCommandInteractionTest('should handle database errors gracefully', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'error-id';

    mockGetReferralCodeById.mockRejectedValueOnce(new Error('Database error'));

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toBeCalledWith('This might be an error with the database. Please try again later.');
  });
});
