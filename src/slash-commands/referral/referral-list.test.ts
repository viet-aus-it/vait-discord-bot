import { faker } from '@faker-js/faker';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './referral-list';
import { getUserReferralCodes } from './utils';

vi.mock('./utils');
const mockGetUserReferralCodes = vi.mocked(getUserReferralCodes);

const userId = 'user_12345';
const guildId = 'guild_12345';

describe('List referral codes', () => {
  chatInputCommandInteractionTest('Should reply with error if referral codes cannot be retrieved', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    mockGetUserReferralCodes.mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(mockGetUserReferralCodes).toHaveBeenCalledOnce();
    expect(mockGetUserReferralCodes).toHaveBeenCalledWith({ userId, guildId });
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('There is some error retrieving your referral codes. Please try again later.');
  });

  chatInputCommandInteractionTest('Should reply with empty message if there are no referral codes', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    mockGetUserReferralCodes.mockResolvedValueOnce([]);

    await execute(interaction);

    expect(mockGetUserReferralCodes).toHaveBeenCalledOnce();
    expect(mockGetUserReferralCodes).toHaveBeenCalledWith({ userId, guildId });
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("You currently don't have any referral codes set up.");
  });

  chatInputCommandInteractionTest('Should reply with list of referral codes if exists', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    const expiryDate = new Date('2024-12-31');
    mockGetUserReferralCodes.mockResolvedValueOnce([
      {
        id: faker.string.uuid(),
        userId,
        guildId,
        service: 'powershop',
        code: 'TESTCODE123',
        expiry_date: expiryDate,
      },
    ]);

    await execute(interaction);

    expect(mockGetUserReferralCodes).toHaveBeenCalledOnce();
    expect(mockGetUserReferralCodes).toHaveBeenCalledWith({ userId, guildId });
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`\`\`\`
| service   | code        | expiry date |
| --------- | ----------- | ----------- |
| powershop | TESTCODE123 | 31/12/2024  |
\`\`\``);
  });

  chatInputCommandInteractionTest('Should format multiple referral codes correctly', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    const expiryDate1 = new Date('2024-12-31');
    const expiryDate2 = new Date('2025-06-15');
    mockGetUserReferralCodes.mockResolvedValueOnce([
      {
        id: faker.string.uuid(),
        userId,
        guildId,
        service: 'american express',
        code: 'AMEX456789',
        expiry_date: expiryDate1,
      },
      {
        id: faker.string.uuid(),
        userId,
        guildId,
        service: 'powershop',
        code: 'POWER123',
        expiry_date: expiryDate2,
      },
    ]);

    await execute(interaction);

    expect(mockGetUserReferralCodes).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`\`\`\`
| service          | code       | expiry date |
| ---------------- | ---------- | ----------- |
| american express | AMEX456789 | 31/12/2024  |
| powershop        | POWER123   | 15/06/2025  |
\`\`\``);
  });
});
