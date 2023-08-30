import { PrismaClient } from '@prisma/client';
import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captor, mockDeep, mockReset } from 'vitest-mock-extended';
import { getPrismaClient } from '../../clients';
import { autocomplete, execute } from './referralNew';
import { services } from './services';

vi.mock('../../clients');
const mockGetPrismaClient = vi.mocked(getPrismaClient);

const mockAutocompleteInteraction = mockDeep<AutocompleteInteraction>();
const mockChatInputInteraction = mockDeep<ChatInputCommandInteraction>();

describe('autocomplete', () => {
  beforeEach(() => {
    mockReset(mockAutocompleteInteraction);
  });

  it('should return nothing if the search term shorter than 4', async () => {
    mockAutocompleteInteraction.options.getString.mockReturnValueOnce('solve');
    const respondInput = captor<Parameters<AutocompleteInteraction['respond']>['0']>();

    await autocomplete(mockAutocompleteInteraction);

    expect(mockAutocompleteInteraction.respond).toBeCalledWith(respondInput);
    expect(respondInput.value.length).toEqual(1);
  });

  it('should return nothing if no options found', async () => {
    mockAutocompleteInteraction.options.getString.mockReturnValueOnce('some random search that not existed');
    const respondInput = captor<Parameters<AutocompleteInteraction['respond']>['0']>();

    await autocomplete(mockAutocompleteInteraction);

    expect(mockAutocompleteInteraction.respond).toBeCalledWith(respondInput);
    expect(respondInput.value.length).toEqual(0);
  });

  it('should return some options if search term longer than 4 and found', async () => {
    mockAutocompleteInteraction.options.getString.mockReturnValueOnce('heal');
    const respondInput = captor<Parameters<AutocompleteInteraction['respond']>['0']>();

    await autocomplete(mockAutocompleteInteraction);

    expect(mockAutocompleteInteraction.respond).toBeCalledWith(respondInput);
    expect(respondInput.value).toMatchInlineSnapshot(`
    [
      {
        "name": "ahm health insurance",
        "value": "ahm health insurance",
      },
      {
        "name": "doctors' health fund",
        "value": "doctors' health fund",
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
        "name": "westfund health insurance",
        "value": "westfund health insurance",
      },
    ]
  `);
  });
});

describe('execute', () => {
  beforeEach(() => {
    mockReset(mockChatInputInteraction);
  });

  it('should return no service error if service is not in services list', async () => {
    const service = 'not in the list';
    mockChatInputInteraction.options.getString.mockImplementation((name, required) => {
      if (name === 'service') return service;
      if (name === 'link_or_code') return null;
      if (name === 'expiry_date' && required) return 'lol';

      return null;
    });

    await execute(mockChatInputInteraction);

    expect(mockChatInputInteraction.reply).toBeCalledWith(`No service named ${service}, ask the admin to add it`);
  });

  it('should return INVALID_DATE error', async () => {
    mockChatInputInteraction.options.getString.mockImplementation((name, required) => {
      if (name === 'service') return services[0];
      if (name === 'link_or_code') return null;
      if (name === 'expiry_date' && required) return 'lol';

      return null;
    });

    await execute(mockChatInputInteraction);

    expect(mockChatInputInteraction.reply).toBeCalledWith('expiry_date is invalid date try format DD/MM/YYYY');
  });

  it('should return EXPIRED_DATE error', async () => {
    const input: { [name: string]: string | null } = {
      service: services[0],
      link_or_code: null,
      expiry_date: '05/04/1994',
    };

    mockChatInputInteraction.options.getString.mockImplementation((name: string) => input[name]);

    await execute(mockChatInputInteraction);

    expect(mockChatInputInteraction.reply).toBeCalledWith('expiry_date has already expired');
  });

  it('should create a new referral code', async () => {
    const data = {
      service: services[0],
      code: 'SomeCodeHere',
      expiry_date: `04/04/${new Date().getFullYear() + 1}`,
    };

    const mockPrismaClient = mockDeep<PrismaClient>();
    const mockReferralInput = captor<{
      data: { service: string; code: string; expiry_date: Date };
    }>();
    mockPrismaClient.referralCode.create.mockResolvedValueOnce({
      id: '12345',
      service: data.service,
      code: data.code,
      expiry_date: new Date(data.expiry_date),
    });
    mockGetPrismaClient.mockReturnValueOnce(mockPrismaClient);

    mockChatInputInteraction.options.getString.mockImplementation((name: string, required?: boolean) => {
      if (name === 'service') return data.service;
      if (name === 'link_or_code') return data.code;
      if (name === 'expiry_date' && required) return data.expiry_date;

      return null;
    });
    const replyInput = captor<string>();

    await execute(mockChatInputInteraction);

    expect(mockPrismaClient.referralCode.create).toBeCalledWith(mockReferralInput);
    const input = mockReferralInput.value;
    expect(input.data.service).toBe(data.service);
    expect(input.data.code).toBe(data.code);
    expect(input.data.expiry_date.toISOString()).toBe(new Date(data.expiry_date).toISOString());

    expect(mockChatInputInteraction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain('new SomeCodeHere in 3commas');
  });
});
