import { type AutocompleteInteraction, Collection, type GuildMember } from 'discord.js';
import { describe, expect, vi } from 'vitest';
import { captor } from 'vitest-mock-extended';
import { autocompleteInteractionTest } from '../../../test/fixtures/autocomplete-interaction';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { autocomplete, execute } from './referral-random';
import { type GetAllReferralCodesForServiceInput, getAllReferralCodesForService } from './utils';

vi.mock('./utils');
const mockGetAllReferralCodesForService = vi.mocked(getAllReferralCodesForService);

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
  chatInputCommandInteractionTest('should return found no code message when no code is found', async ({ interaction }) => {
    const service = 'not existed service';

    const mockReferralInput = captor<GetAllReferralCodesForServiceInput>();
    mockGetAllReferralCodesForService.mockResolvedValueOnce([]);
    interaction.options.getString.mockReturnValueOnce(service);
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockGetAllReferralCodesForService).toBeCalledWith(mockReferralInput);
    expect(mockReferralInput.value.service).toContain(service);
    expect(interaction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain(`There is no code for ${service} service`);
  });

  chatInputCommandInteractionTest('should return code if found', async ({ interaction }) => {
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
    interaction.options.getString.mockReturnValueOnce(service);
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockGetAllReferralCodesForService).toBeCalledWith(mockReferralInput);
    expect(mockReferralInput.value.service).toContain(service);
    expect(interaction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain(`Service ${service}: ${code} added by user 12345`);
  });

  chatInputCommandInteractionTest('should return member name if found', async ({ interaction }) => {
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
    interaction.options.getString.mockReturnValueOnce(service);
    const members = new Collection<string, GuildMember>();
    members.set('1234', { displayName: 'SomeMember' } as GuildMember);
    interaction.guild?.members.fetch.mockResolvedValueOnce(members);
    const replyInput = captor<string>();

    await execute(interaction);

    expect(mockGetAllReferralCodesForService).toBeCalledWith(mockReferralInput);
    expect(mockReferralInput.value.service).toContain(service);
    expect(interaction.reply).toBeCalledWith(replyInput);
    expect(replyInput.value).toContain(`Service ${service.trim().toLowerCase()}: ${code}`);
  });
});
