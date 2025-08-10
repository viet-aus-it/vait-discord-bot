import { addDays } from 'date-fns';
import { describe, expect, vi } from 'vitest';
import { captor } from 'vitest-mock-extended';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './referral-update';
import { type GetReferralCodeByIdInput, getReferralCodeById, type UpdateReferralCodeInput, updateReferralCode } from './utils';

vi.mock('./utils');
const mockGetReferralCodeById = vi.mocked(getReferralCodeById);
const mockUpdateReferralCode = vi.mocked(updateReferralCode);

describe('referral-update execute', () => {
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
  });

  chatInputCommandInteractionTest('should return error when no updates provided', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'existing-id';
    const existingReferral = {
      id: referralId,
      service: 'powershop',
      code: 'EXISTING123',
      expiry_date: new Date('2025-12-31'),
      userId,
      guildId,
    };

    mockGetReferralCodeById.mockResolvedValueOnce(existingReferral);

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toBeCalledWith('Please specify either a new code/link or expiry date to update.');
  });

  chatInputCommandInteractionTest('should update code when new code provided', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'existing-id';
    const newCode = 'NEWCODE456';
    const existingReferral = {
      id: referralId,
      service: 'powershop',
      code: 'EXISTING123',
      expiry_date: new Date('2025-12-31'),
      userId,
      guildId,
    };

    const mockUpdateInput = captor<UpdateReferralCodeInput>();
    mockGetReferralCodeById.mockResolvedValueOnce(existingReferral);
    mockUpdateReferralCode.mockResolvedValueOnce({ count: 1 });

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      if (name === 'link_or_code') return newCode;
      return null;
    });
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockUpdateReferralCode).toBeCalledWith(mockUpdateInput);
    expect(mockUpdateInput.value.id).toBe(referralId);
    expect(mockUpdateInput.value.userId).toBe(userId);
    expect(mockUpdateInput.value.guildId).toBe(guildId);
    expect(mockUpdateInput.value.code).toBe(newCode);
    expect(interaction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain('Successfully updated referral for **powershop**');
    expect(replyInput.value).toContain(`New code: \`${newCode}\``);
  });

  chatInputCommandInteractionTest('should update expiry date when provided', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'existing-id';
    const newExpiryDate = `31/12/${new Date().getFullYear() + 1}`;
    const existingReferral = {
      id: referralId,
      service: 'powershop',
      code: 'EXISTING123',
      expiry_date: new Date('2025-12-31'),
      userId,
      guildId,
    };

    const mockUpdateInput = captor<UpdateReferralCodeInput>();
    mockGetReferralCodeById.mockResolvedValueOnce(existingReferral);
    mockUpdateReferralCode.mockResolvedValueOnce({ count: 1 });

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      if (name === 'expiry_date') return newExpiryDate;
      return null;
    });
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockUpdateReferralCode).toBeCalledWith(mockUpdateInput);
    expect(mockUpdateInput.value.expiryDate).toBeDefined();
    expect(interaction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain('Successfully updated referral for **powershop**');
    expect(replyInput.value).toContain('New expiry:');
  });

  chatInputCommandInteractionTest('should extend expiry by default when no specific updates provided but empty strings given', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'existing-id';
    const existingReferral = {
      id: referralId,
      service: 'powershop',
      code: 'EXISTING123',
      expiry_date: new Date('2025-12-31'),
      userId,
      guildId,
    };

    const mockUpdateInput = captor<UpdateReferralCodeInput>();
    mockGetReferralCodeById.mockResolvedValueOnce(existingReferral);
    mockUpdateReferralCode.mockResolvedValueOnce({ count: 1 });

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      // Return null for optional fields to trigger default expiry extension
      return null;
    });

    await execute(interaction);

    expect(mockUpdateReferralCode).toBeCalledWith(mockUpdateInput);
    expect(mockUpdateInput.value.expiryDate).toBeDefined();
    // Should extend by 30 days from now
    const expectedDate = addDays(new Date(), 30);
    const actualDate = mockUpdateInput.value.expiryDate!;
    expect(actualDate.toDateString()).toBe(expectedDate.toDateString());
  });

  chatInputCommandInteractionTest('should return error for invalid date format', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'existing-id';
    const invalidDate = 'invalid-date';
    const existingReferral = {
      id: referralId,
      service: 'powershop',
      code: 'EXISTING123',
      expiry_date: new Date('2025-12-31'),
      userId,
      guildId,
    };

    mockGetReferralCodeById.mockResolvedValueOnce(existingReferral);

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      if (name === 'expiry_date') return invalidDate;
      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toBeCalledWith('expiry_date is an invalid date. Please use the format DD/MM/YYYY.');
  });

  chatInputCommandInteractionTest('should return error for expired date', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const referralId = 'existing-id';
    const expiredDate = `01/01/${new Date().getFullYear() - 1}`;
    const existingReferral = {
      id: referralId,
      service: 'powershop',
      code: 'EXISTING123',
      expiry_date: new Date('2025-12-31'),
      userId,
      guildId,
    };

    mockGetReferralCodeById.mockResolvedValueOnce(existingReferral);

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    interaction.options.getString.mockImplementation((name: string, _required?: boolean) => {
      if (name === 'id') return referralId;
      if (name === 'expiry_date') return expiredDate;
      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toBeCalledWith('expiry_date has already expired');
  });
});
