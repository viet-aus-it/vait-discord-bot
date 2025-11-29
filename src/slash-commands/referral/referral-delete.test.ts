import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './referral-delete';
import { deleteReferralCode } from './utils';

vi.mock('./utils');
const mockDeleteReferralCode = vi.mocked(deleteReferralCode);

const userId = 'user_12345';
const guildId = 'guild_12345';
const service = 'powershop';

describe('Delete referral code', () => {
  chatInputCommandInteractionTest('Should delete referral code successfully', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      return null;
    });

    mockDeleteReferralCode.mockResolvedValueOnce({ count: 1 });

    await execute(interaction);

    expect(mockDeleteReferralCode).toHaveBeenCalledOnce();
    expect(mockDeleteReferralCode).toHaveBeenCalledWith({
      service,
      userId,
      guildId,
    });
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Referral code for service "${service}" has been deleted.`);
  });

  chatInputCommandInteractionTest('Should reply with error if referral not found', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      return null;
    });

    mockDeleteReferralCode.mockResolvedValueOnce({ count: 0 });

    await execute(interaction);

    expect(mockDeleteReferralCode).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Cannot find referral code for service "${service}". Please check the service name and try again.`);
  });

  chatInputCommandInteractionTest('Should reply with error if database operation fails', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      return null;
    });

    mockDeleteReferralCode.mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(mockDeleteReferralCode).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Failed to delete referral code. Please try again later.');
  });
});
