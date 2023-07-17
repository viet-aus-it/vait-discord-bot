import { vi, it, describe, expect, beforeEach } from 'vitest';
import { captor, mockDeep, mockReset } from 'vitest-mock-extended';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../../clients';
import { autocomplete, execute } from './referralRandom';

vi.mock('../../clients');
const mockGetPrismaClient = vi.mocked(getPrismaClient);

const mockAutocompleteInteraction = mockDeep<AutocompleteInteraction>();
const mockChatInputInteraction = mockDeep<ChatInputCommandInteraction>();
const mockPrismaClient = mockDeep<PrismaClient>();

describe('autocomplete', () => {
  beforeEach(() => {
    mockReset(mockAutocompleteInteraction);
  });

  it('should return nothing if the search term shorter than 4', async () => {
    mockAutocompleteInteraction.options.getString.mockReturnValueOnce('solve');
    const respondInput =
      captor<Parameters<AutocompleteInteraction['respond']>['0']>();

    await autocomplete(mockAutocompleteInteraction);

    expect(mockAutocompleteInteraction.respond).toBeCalledWith(respondInput);
    expect(respondInput.value.length).toEqual(1);
  });

  it('should return nothing if no options found', async () => {
    mockAutocompleteInteraction.options.getString.mockReturnValueOnce(
      'some random search that not existed'
    );
    const respondInput =
      captor<Parameters<AutocompleteInteraction['respond']>['0']>();

    await autocomplete(mockAutocompleteInteraction);

    expect(mockAutocompleteInteraction.respond).toBeCalledWith(respondInput);
    expect(respondInput.value.length).toEqual(0);
  });

  it('should return some options if search term longer than 4 and found', async () => {
    mockAutocompleteInteraction.options.getString.mockReturnValueOnce('heal');
    const respondInput =
      captor<Parameters<AutocompleteInteraction['respond']>['0']>();

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
  it('should return found no code message when no code is found', async () => {
    const service = 'not existed service';

    const mockReferralInput = captor<{
      where: { service: { contains: string } };
    }>();
    mockPrismaClient.referralCode.findMany.mockResolvedValueOnce([]);
    mockGetPrismaClient.mockReturnValueOnce(mockPrismaClient);
    mockChatInputInteraction.options.getString.mockReturnValueOnce(service);
    const replyInput = captor<string>();

    await execute(mockChatInputInteraction);

    expect(mockPrismaClient.referralCode.findMany).toBeCalledWith(
      mockReferralInput
    );
    expect(mockReferralInput.value.where.service.contains).toEqual(service);
    expect(mockChatInputInteraction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toEqual(
      `There is no code for ${service.trim().toLowerCase()} service`
    );
  });

  it('should return code if found', async () => {
    const service = 'some service';
    const code = 'SomeCode';
    const expiryDate = new Date(`05/04/${new Date().getFullYear() + 1}`);

    const mockReferralInput = captor<{
      where: { service: { contains: string } };
    }>();
    mockPrismaClient.referralCode.findMany.mockResolvedValueOnce([
      {
        id: '1',
        code,
        expiry_date: expiryDate,
        service,
      },
    ]);
    mockGetPrismaClient.mockReturnValueOnce(mockPrismaClient);
    mockChatInputInteraction.options.getString.mockReturnValueOnce(service);
    const replyInput = captor<string>();

    await execute(mockChatInputInteraction);

    expect(mockPrismaClient.referralCode.findMany).toBeCalledWith(
      mockReferralInput
    );
    expect(mockReferralInput.value.where.service.contains).toEqual(service);
    expect(mockChatInputInteraction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toEqual(
      `Service ${service.trim().toLowerCase()}: ${code}`
    );
  });
});
