import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './referral-update';
import { updateReferralCode } from './utils';

vi.mock('./utils');
const mockUpdateReferralCode = vi.mocked(updateReferralCode);

const userId = 'user_12345';
const guildId = 'guild_12345';
const service = 'powershop';
const newCode = 'NEWCODE123';

describe('Update referral code', () => {
  chatInputCommandInteractionTest('Should reply with error if no fields to update', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      return null;
    });

    await execute(interaction);

    expect(mockUpdateReferralCode).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Nothing to update. Please provide either a new link/code or expiry date.');
  });

  chatInputCommandInteractionTest('Should reply with error if expiry date is invalid', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'expiry_date') return 'invalid-date';
      return null;
    });

    await execute(interaction);

    expect(mockUpdateReferralCode).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('expiry_date is an invalid date. Please use the format DD/MM/YYYY.');
  });

  chatInputCommandInteractionTest('Should reply with error if expiry date is in the past', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'expiry_date') return '01/01/2020';
      return null;
    });

    await execute(interaction);

    expect(mockUpdateReferralCode).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('expiry_date has already expired');
  });

  chatInputCommandInteractionTest('Should update code successfully', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'link_or_code') return newCode;
      return null;
    });

    mockUpdateReferralCode.mockResolvedValueOnce({ count: 1 });

    await execute(interaction);

    expect(mockUpdateReferralCode).toHaveBeenCalledOnce();
    expect(mockUpdateReferralCode).toHaveBeenCalledWith({
      service,
      userId,
      guildId,
      code: newCode,
      expiryDate: undefined,
    });
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Referral code for service "${service}" has been updated with code: ${newCode}.`);
  });

  chatInputCommandInteractionTest('Should update expiry date successfully', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    const expiryDateString = '31/12/2025';
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'expiry_date') return expiryDateString;
      return null;
    });

    mockUpdateReferralCode.mockResolvedValueOnce({ count: 1 });

    await execute(interaction);

    expect(mockUpdateReferralCode).toHaveBeenCalledOnce();
    const callArgs = mockUpdateReferralCode.mock.calls[0][0];
    expect(callArgs.service).toBe(service);
    expect(callArgs.userId).toBe(userId);
    expect(callArgs.guildId).toBe(guildId);
    expect(callArgs.code).toBeUndefined();
    expect(callArgs.expiryDate).toBeInstanceOf(Date);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining(`Referral code for service "${service}" has been updated with expires:`));
  });

  chatInputCommandInteractionTest('Should update both code and expiry date', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    const expiryDateString = '31/12/2025';
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'link_or_code') return newCode;
      if (name === 'expiry_date') return expiryDateString;
      return null;
    });

    mockUpdateReferralCode.mockResolvedValueOnce({ count: 1 });

    await execute(interaction);

    expect(mockUpdateReferralCode).toHaveBeenCalledOnce();
    const callArgs = mockUpdateReferralCode.mock.calls[0][0];
    expect(callArgs.service).toBe(service);
    expect(callArgs.code).toBe(newCode);
    expect(callArgs.expiryDate).toBeInstanceOf(Date);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('code:'));
    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('expires:'));
  });

  chatInputCommandInteractionTest('Should reply with error if referral not found', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'link_or_code') return newCode;
      return null;
    });

    mockUpdateReferralCode.mockResolvedValueOnce({ count: 0 });

    await execute(interaction);

    expect(mockUpdateReferralCode).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Cannot find referral code for service "${service}". Please check the service name and try again.`);
  });

  chatInputCommandInteractionTest('Should reply with error if database operation fails', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'link_or_code') return newCode;
      return null;
    });

    mockUpdateReferralCode.mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(mockUpdateReferralCode).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Failed to update referral code. Please try again later.');
  });
});
