import { faker } from '@faker-js/faker';
import { describe, expect, vi } from 'vitest';

import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedReferralCode, seedUser } from '../../../test/fixtures/db-seed';
import { execute, MAX_REFERRAL_CODE_LENGTH } from './referral-list';
import * as utils from './utils';

const userId = 'user_12345';
const guildId = 'guild_12345';

describe('List referral codes', () => {
  chatInputCommandInteractionTest('Should reply with error if referral codes cannot be retrieved', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;
    vi.spyOn(utils, 'getUserReferralCodes').mockRejectedValueOnce(new Error('Synthetic error'));

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('There is some error retrieving your referral codes. Please try again later.');
  });

  chatInputCommandInteractionTest('Should reply with empty message if there are no referral codes', async ({ interaction }) => {
    interaction.user.id = userId;
    interaction.guildId = guildId;

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("You currently don't have any referral codes set up.");
  });

  chatInputCommandInteractionTest('Should reply with list of referral codes if exists', async ({ interaction }) => {
    await seedUser(userId);
    await seedReferralCode({ userId, guildId, service: 'powershop', code: 'TESTCODE123', expiry_date: new Date('2099-12-31') });

    interaction.user.id = userId;
    interaction.guildId = guildId;

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`\`\`\`
| service   | code        | expiry date |
| --------- | ----------- | ----------- |
| powershop | TESTCODE123 | 31/12/2099  |
\`\`\``);
  });

  chatInputCommandInteractionTest('Should format multiple referral codes correctly', async ({ interaction }) => {
    await seedUser(userId);
    await seedReferralCode({ userId, guildId, service: 'american express', code: 'AMEX456789', expiry_date: new Date('2099-12-31') });
    await seedReferralCode({ userId, guildId, service: 'powershop', code: 'POWER123', expiry_date: new Date('2099-06-15') });

    interaction.user.id = userId;
    interaction.guildId = guildId;

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`\`\`\`
| service          | code       | expiry date |
| ---------------- | ---------- | ----------- |
| american express | AMEX456789 | 31/12/2099  |
| powershop        | POWER123   | 15/06/2099  |
\`\`\``);
  });

  chatInputCommandInteractionTest('Should trim long URL or code to the max length', async ({ interaction }) => {
    const code1 = faker.string.alphanumeric({ length: MAX_REFERRAL_CODE_LENGTH + 10 });
    const code2 = faker.string.alphanumeric({ length: MAX_REFERRAL_CODE_LENGTH });
    const code3 = faker.string.alphanumeric({ length: MAX_REFERRAL_CODE_LENGTH - 10 });

    await seedUser(userId);
    await seedReferralCode({ userId, guildId, service: 'american express', code: code1, expiry_date: new Date('2099-12-31') });
    await seedReferralCode({ userId, guildId, service: 'american express 2', code: code2, expiry_date: new Date('2099-12-31') });
    await seedReferralCode({ userId, guildId, service: 'american express 3', code: code3, expiry_date: new Date('2099-12-31') });

    interaction.user.id = userId;
    interaction.guildId = guildId;

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`\`\`\`
| service            | ${'code'.padEnd(MAX_REFERRAL_CODE_LENGTH, ' ')} | expiry date |
| ------------------ | ${`-`.repeat(MAX_REFERRAL_CODE_LENGTH)} | ----------- |
| american express   | ${code1.slice(0, MAX_REFERRAL_CODE_LENGTH - 3)}... | 31/12/2099  |
| american express 2 | ${code2} | 31/12/2099  |
| american express 3 | ${code3.padEnd(MAX_REFERRAL_CODE_LENGTH, ' ')} | 31/12/2099  |
\`\`\``);
  });
});
