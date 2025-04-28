import { faker } from '@faker-js/faker';
import type { AutocompleteInteraction } from 'discord.js';
import { test } from 'vitest';
import { type DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended';

interface AutocompleteInteractionTest {
  interaction: DeepMockProxy<AutocompleteInteraction>;
}

const interaction = mockDeep<AutocompleteInteraction>();

const guildId = `guild_${faker.string.nanoid()}`;

export const autocompleteInteractionTest = test.extend<AutocompleteInteractionTest>({
  interaction: async ({}, use) => {
    interaction.guildId = guildId;

    await use(interaction);

    mockReset(interaction);
  },
});
