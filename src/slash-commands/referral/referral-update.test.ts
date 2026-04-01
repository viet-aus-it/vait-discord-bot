import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { describe, expect, vi } from 'vitest';

import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedReferralCode, seedUser } from '../../../test/fixtures/db-seed';
import { DAY_MONTH_YEAR_FORMAT } from '../../utils/date';
import { execute } from './referral-update';
import * as utils from './utils';

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

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('expiry_date has already expired');
  });

  chatInputCommandInteractionTest('Should update code successfully', async ({ interaction }) => {
    await seedUser(userId);
    await seedReferralCode({ userId, guildId, service, code: 'OLDCODE', expiry_date: new Date('2099-12-31') });

    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'link_or_code') return newCode;
      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`Referral code for service "${service}" has been updated with code: ${newCode}.`);
  });

  chatInputCommandInteractionTest('Should update expiry date successfully', async ({ interaction }) => {
    await seedUser(userId);
    await seedReferralCode({ userId, guildId, service, code: 'OLDCODE', expiry_date: new Date('2099-12-31') });

    const expiryDateString = format(faker.date.future({ years: 1 }), DAY_MONTH_YEAR_FORMAT);
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'expiry_date') return expiryDateString;
      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining(`Referral code for service "${service}" has been updated with expires:`));
  });

  chatInputCommandInteractionTest('Should update both code and expiry date', async ({ interaction }) => {
    await seedUser(userId);
    await seedReferralCode({ userId, guildId, service, code: 'OLDCODE', expiry_date: new Date('2099-12-31') });

    const expiryDateString = format(faker.date.future({ years: 1 }), DAY_MONTH_YEAR_FORMAT);
    interaction.user.id = userId;
    interaction.guildId = guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return service;
      if (name === 'link_or_code') return newCode;
      if (name === 'expiry_date') return expiryDateString;
      return null;
    });

    await execute(interaction);

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

    await execute(interaction);

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

    vi.spyOn(utils, 'updateReferralCode').mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Failed to update referral code. Please try again later.');
  });
});
