import type { AutocompleteInteraction, Guild } from 'discord.js';
import { describe, expect } from 'vitest';
import { captor } from 'vitest-mock-extended';

import { autocompleteInteractionTest } from '../../../test/fixtures/autocomplete-interaction';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedReferralCode, seedUser } from '../../../test/fixtures/db-seed';
import { autocomplete, execute } from './referral-random';

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
    interaction.options.getString.mockReturnValueOnce(service);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`There is no code for ${service} service in the system.`);
  });

  chatInputCommandInteractionTest('should return code if found', async ({ interaction }) => {
    const service = 'some service';
    const code = 'SomeCode';
    const expiryDate = new Date(`05/04/${new Date().getFullYear() + 1}`);
    const guildId = (interaction.guild as Guild).id;

    await seedUser('12345');
    await seedReferralCode({ userId: '12345', guildId, service, code, expiry_date: expiryDate });

    interaction.options.getString.mockReturnValueOnce(service);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining(`Service ${service}: ${code}`));
  });

  chatInputCommandInteractionTest('should return member name if found', async ({ interaction }) => {
    const service = 'some service';
    const code = 'SomeCode';
    const expiryDate = new Date(`05/04/${new Date().getFullYear() + 1}`);
    const guildId = (interaction.guild as Guild).id;

    await seedUser('1234');
    await seedReferralCode({ userId: '1234', guildId, service, code, expiry_date: expiryDate });

    interaction.options.getString.mockReturnValueOnce(service);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (interaction.guild?.members.fetch as any).mockResolvedValueOnce({ displayName: 'SomeMember' });

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining(`Service ${service.trim().toLowerCase()}: ${code}`));
  });
});
