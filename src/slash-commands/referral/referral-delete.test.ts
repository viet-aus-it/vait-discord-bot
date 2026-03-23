import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedReferralCode, seedUser } from '../../../test/fixtures/db-seed';
import { execute } from './referral-delete';
import * as utils from './utils';

const userId = 'user_12345';
const guildId = 'guild_12345';
const service = 'powershop';

describe('Delete referral code', () => {
  chatInputCommandInteractionTest('Should delete referral code successfully', async ({ interaction }) => {
    await seedUser(userId);
    await seedReferralCode({ userId, guildId, service, code: 'CODE123', expiry_date: new Date('2099-12-31') });

    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      return null;
    });

    await execute(interaction);

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

    await execute(interaction);

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

    vi.spyOn(utils, 'deleteReferralCode').mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Failed to delete referral code. Please try again later.');
  });
});
