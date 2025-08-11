import { describe, expect, vi } from 'vitest';
import { captor } from 'vitest-mock-extended';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './referral-list';
import { type GetUserReferralCodesInput, getUserReferralCodes } from './utils';

vi.mock('./utils');
const mockGetUserReferralCodes = vi.mocked(getUserReferralCodes);

describe('referral-list execute', () => {
  chatInputCommandInteractionTest('should return no referrals message when user has no referrals', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';

    const mockInput = captor<GetUserReferralCodesInput>();
    mockGetUserReferralCodes.mockResolvedValueOnce([]);

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockGetUserReferralCodes).toBeCalledWith(mockInput);
    expect(mockInput.value.userId).toBe(userId);
    expect(mockInput.value.guildId).toBe(guildId);
    expect(interaction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toBe('You have no referral codes in the system.');
  });

  chatInputCommandInteractionTest('should return formatted table when user has referrals', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const expiryDate = new Date('2025-12-31');

    const mockReferrals = [
      {
        id: 'abcd1234-5678-90ef-ghij-klmnopqrstuv',
        service: 'powershop',
        code: 'TESTCODE123',
        expiry_date: expiryDate,
        userId,
        guildId,
      },
      {
        id: 'efgh5678-1234-56ab-cdef-ghijklmnopqr',
        service: 'very long service name that should be truncated',
        code: 'ANOTHER456',
        expiry_date: expiryDate,
        userId,
        guildId,
      },
    ];

    const mockInput = captor<GetUserReferralCodesInput>();
    mockGetUserReferralCodes.mockResolvedValueOnce(mockReferrals);

    interaction.user.id = userId;
    interaction.guild!.id = guildId;
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockGetUserReferralCodes).toBeCalledWith(mockInput);
    expect(mockInput.value.userId).toBe(userId);
    expect(mockInput.value.guildId).toBe(guildId);
    expect(interaction.reply).toBeCalledWith(replyInput);

    const message = replyInput.value;
    // Check that it contains the table header
    expect(message).toContain('Your Referral Codes:');
    expect(message).toContain('| ID       | Service Name');
    // Check that it contains short IDs
    expect(message).toContain('| abcd1234 | powershop');
    expect(message).toContain('| efgh5678 | very long service...');
    // Check that it contains full details
    expect(message).toContain('**Full Details:**');
    expect(message).toContain('**powershop**');
    expect(message).toContain('Code: `TESTCODE123`');
    expect(message).toContain('**very long service name that should be truncated**');
    expect(message).toContain('Code: `ANOTHER456`');
  });

  chatInputCommandInteractionTest('should handle long messages by splitting them', async ({ interaction }) => {
    const userId = '1234';
    const guildId = '5678';
    const expiryDate = new Date('2025-12-31');

    // Create many referrals to exceed message limit
    const mockReferrals = Array.from({ length: 20 }, (_, i) => ({
      id: `referral-id-${i.toString().padStart(10, '0')}-very-long-id-to-test-message-limits`,
      service: `service-name-${i}-with-a-very-long-name-to-make-the-message-exceed-discord-limit`,
      code: `TESTCODE${i.toString().padStart(10, '0')}`,
      expiry_date: expiryDate,
      userId,
      guildId,
    }));

    mockGetUserReferralCodes.mockResolvedValueOnce(mockReferrals);

    interaction.user.id = userId;
    interaction.guild!.id = guildId;

    await execute(interaction);

    expect(mockGetUserReferralCodes).toBeCalled();
    expect(interaction.reply).toBeCalled();
    // Should call followUp when message is too long
    expect(interaction.followUp).toBeCalled();
  });
});
