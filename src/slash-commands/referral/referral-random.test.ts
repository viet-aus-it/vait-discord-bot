import { type AutocompleteInteraction, type ChatInputCommandInteraction, Collection, type GuildMember } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captor, mockDeep, mockReset } from 'vitest-mock-extended';
import { autocomplete, execute } from './referral-random';
import { type GetAllReferralCodesForServiceInput, getAllReferralCodesForService } from './utils';

vi.mock('./utils');
const mockGetAllReferralCodesForService = vi.mocked(getAllReferralCodesForService);

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
  it('should return found no code message when no code is found', async () => {
    const service = 'not existed service';

    const mockReferralInput = captor<GetAllReferralCodesForServiceInput>();
    mockGetAllReferralCodesForService.mockResolvedValueOnce([]);
    mockChatInputInteraction.options.getString.mockReturnValueOnce(service);
    const replyInput = captor<string>();

    await execute(mockChatInputInteraction);

    expect(mockGetAllReferralCodesForService).toBeCalledWith(mockReferralInput);
    expect(mockReferralInput.value.service).toContain(service);
    expect(mockChatInputInteraction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain(`There is no code for ${service} service`);
  });

  it('should return code if found', async () => {
    const service = 'some service';
    const code = 'SomeCode';
    const expiryDate = new Date(`05/04/${new Date().getFullYear() + 1}`);

    const mockReferralInput = captor<GetAllReferralCodesForServiceInput>();
    mockGetAllReferralCodesForService.mockResolvedValueOnce([
      {
        id: '1',
        code,
        expiry_date: expiryDate,
        service,
        userId: '12345',
        guildId: '12345',
      },
    ]);
    mockChatInputInteraction.options.getString.mockReturnValueOnce(service);
    const replyInput = captor<string>();

    await execute(mockChatInputInteraction);

    expect(mockGetAllReferralCodesForService).toBeCalledWith(mockReferralInput);
    expect(mockReferralInput.value.service).toContain(service);
    expect(mockChatInputInteraction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain(`Service ${service}: ${code} added by user 12345`);
  });

  it('should return member name if found', async () => {
    const service = 'some service';
    const code = 'SomeCode';
    const expiryDate = new Date(`05/04/${new Date().getFullYear() + 1}`);

    const mockReferralInput = captor<GetAllReferralCodesForServiceInput>();
    mockGetAllReferralCodesForService.mockResolvedValueOnce([
      {
        id: '1',
        code,
        expiry_date: expiryDate,
        service,
        userId: '1234',
        guildId: '1234',
      },
    ]);
    mockChatInputInteraction.options.getString.mockReturnValueOnce(service);
    const members = new Collection<string, GuildMember>();
    members.set('1234', { displayName: 'SomeMember' } as GuildMember);
    mockChatInputInteraction.guild?.members.fetch.mockResolvedValueOnce(members);
    const replyInput = captor<string>();

    await execute(mockChatInputInteraction);

    expect(mockGetAllReferralCodesForService).toBeCalledWith(mockReferralInput);
    expect(mockReferralInput.value.service).toContain(service);
    expect(mockChatInputInteraction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain(`Service ${service.trim().toLowerCase()}: ${code}`);
  });
});
