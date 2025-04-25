import { addDays } from 'date-fns';
import type { AutocompleteInteraction, Guild } from 'discord.js';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import { captor } from 'vitest-mock-extended';
import { autocompleteInteractionTest } from '../../../test/fixtures/autocomplete-interaction';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { getOrCreateUser } from '../reputation/utils';
import { DEFAULT_EXPIRY_DAYS_FROM_NOW, autocomplete, execute } from './referral-new';
import { services } from './services';
import { type CreateReferralInput, createReferralCode, findExistingReferralCode } from './utils';

vi.mock('./utils');
const mockFindExistingReferralCode = vi.mocked(findExistingReferralCode);
const mockCreateReferralCode = vi.mocked(createReferralCode);

vi.mock('../reputation/utils');
const mockGetOrCreateUser = vi.mocked(getOrCreateUser);

describe('autocomplete', () => {
  autocompleteInteractionTest('should return nothing if the search term shorter than 4', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('solve');
    const respondInput = captor<Parameters<AutocompleteInteraction['respond']>['0']>();

    await autocomplete(interaction);

    expect(interaction.respond).toBeCalledWith(respondInput);
    expect(respondInput.value.length).toEqual(1);
  });

  autocompleteInteractionTest('should return nothing if no options found', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('some random search that not existed');
    const respondInput = captor<Parameters<AutocompleteInteraction['respond']>['0']>();

    await autocomplete(interaction);

    expect(interaction.respond).toBeCalledWith(respondInput);
    expect(respondInput.value.length).toEqual(0);
  });

  autocompleteInteractionTest('should return some options if search term longer than 4 and found', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('heal');
    const respondInput = captor<Parameters<AutocompleteInteraction['respond']>['0']>();

    await autocomplete(interaction);

    expect(interaction.respond).toBeCalledWith(respondInput);
    expect(respondInput.value).toMatchInlineSnapshot(`
      [
        {
          "name": "ahm health insurance",
          "value": "ahm health insurance",
        },
        {
          "name": "doctors health by avant",
          "value": "doctors health by avant",
        },
        {
          "name": "phoenix health fund",
          "value": "phoenix health fund",
        },
        {
          "name": "qantas insurance - health insurance",
          "value": "qantas insurance - health insurance",
        },
        {
          "name": "queensland country health fund",
          "value": "queensland country health fund",
        },
        {
          "name": "teachers health",
          "value": "teachers health",
        },
        {
          "name": "westfund health insurance",
          "value": "westfund health insurance",
        },
      ]
    `);
  });
});

describe('execute', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const date = new Date();
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  chatInputCommandInteractionTest('should return no service error if service is not in services list', async ({ interaction }) => {
    const service = 'not in the list';
    interaction.options.getString.mockImplementation((name, required) => {
      if (name === 'service') return service;
      if (name === 'link_or_code') return null;
      if (name === 'expiry_date' && required) return 'lol';

      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toBeCalledWith(`No service named ${service}, ask the admin to add it`);
  });

  chatInputCommandInteractionTest('should return INVALID_DATE error when provide invalid expiry date format', async ({ interaction }) => {
    interaction.options.getString.mockImplementation((name) => {
      if (name === 'service') return services[0];
      if (name === 'link_or_code') return null;
      if (name === 'expiry_date') return 'lol';

      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toBeCalledWith('expiry_date is invalid date try format DD/MM/YYYY');
  });

  chatInputCommandInteractionTest('should return EXPIRED_DATE error when expiry date is in the past', async ({ interaction }) => {
    const input: Record<string, string | null> = {
      service: services[0],
      link_or_code: null,
      expiry_date: `04/04/${new Date().getFullYear() - 10}`,
    };

    interaction.options.getString.mockImplementation((name: string) => input[name]);

    await execute(interaction);

    expect(interaction.reply).toBeCalledWith('expiry_date has already expired');
  });

  chatInputCommandInteractionTest('should block adding referral code if the user already has one', async ({ interaction }) => {
    const data = {
      service: services[0],
      code: 'SomeCodeHere',
      expiry_date: `04/04/${new Date().getFullYear() + 1}`,
      userId: '1234',
      guildId: '1234',
    };

    mockFindExistingReferralCode.mockResolvedValueOnce({
      id: '12345',
      service: data.service,
      code: data.code,
      expiry_date: new Date(data.expiry_date),
      userId: data.userId,
      guildId: data.guildId,
    });
    mockGetOrCreateUser.mockResolvedValueOnce({ id: data.userId, reputation: 0 });

    interaction.user.id = data.userId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return data.service;
      if (name === 'link_or_code') return data.code;
      if (name === 'expiry_date') return data.expiry_date;

      return null;
    });

    await execute(interaction);

    expect(interaction.reply).toBeCalledWith(`You have already entered the referral code for ${services[0]}.`);
  });

  chatInputCommandInteractionTest('should create a new referral code', async ({ interaction }) => {
    const data = {
      service: services[0],
      code: 'SomeCodeHere',
      expiry_date: `04/04/${new Date().getFullYear() + 1}`,
      userId: '1234',
      guildId: '12345',
    };

    const mockReferralInput = captor<CreateReferralInput>();
    mockFindExistingReferralCode.mockResolvedValueOnce(null);
    mockCreateReferralCode.mockResolvedValueOnce({
      id: '12345',
      service: data.service,
      code: data.code,
      expiry_date: new Date(data.expiry_date),
      userId: data.userId,
      guildId: data.guildId,
    });
    mockGetOrCreateUser.mockResolvedValueOnce({ id: data.userId, reputation: 0 });

    interaction.user.id = data.userId;
    (interaction.guild as Guild).id = data.guildId;
    interaction.options.getString.mockImplementation((name: string) => {
      if (name === 'service') return data.service;
      if (name === 'link_or_code') return data.code;
      if (name === 'expiry_date') return data.expiry_date;

      return null;
    });
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockCreateReferralCode).toBeCalledWith(mockReferralInput);
    const input = mockReferralInput.value;
    expect(input.service).toBe(data.service);
    expect(input.code).toBe(data.code);
    expect(input.expiryDate.toISOString()).toBe(new Date(data.expiry_date).toISOString());

    expect(interaction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain(`just added referral code SomeCodeHere in ${services[0]}`);
  });

  chatInputCommandInteractionTest(
    `should create a new referral code in ${DEFAULT_EXPIRY_DAYS_FROM_NOW} days from now when not given the expiry date`,
    async ({ interaction }) => {
      const data = {
        service: services[0],
        code: 'SomeCodeHere',
        userId: '1234',
        guildId: '12345',
        expiry_date: addDays(new Date(), DEFAULT_EXPIRY_DAYS_FROM_NOW),
      };

      const mockReferralInput = captor<CreateReferralInput>();
      mockFindExistingReferralCode.mockResolvedValueOnce(null);
      mockCreateReferralCode.mockResolvedValueOnce({
        id: '12345',
        service: data.service,
        code: data.code,
        expiry_date: data.expiry_date,
        userId: data.userId,
        guildId: data.guildId,
      });

      interaction.user.id = data.userId;
      (interaction.guild as Guild).id = data.guildId;
      interaction.options.getString.mockImplementation((name: string) => {
        if (name === 'service') return data.service;
        if (name === 'link_or_code') return data.code;
        if (name === 'expiry_date') return null;

        return null;
      });
      const replyInput = captor<string>();

      await execute(interaction);

      expect(mockCreateReferralCode).toBeCalledWith(mockReferralInput);
      const input = mockReferralInput.value;
      expect(input.service).toBe(data.service);
      expect(input.code).toBe(data.code);
      expect(input.expiryDate.toISOString()).toBe(new Date(data.expiry_date).toISOString());

      expect(interaction.reply).toBeCalledWith(replyInput);
      expect(replyInput.value).toContain(`just added referral code SomeCodeHere in ${services[0]}`);
    }
  );
});
