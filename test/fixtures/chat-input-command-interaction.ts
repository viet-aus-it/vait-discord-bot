import { faker } from '@faker-js/faker';
import type { ChatInputCommandInteraction } from 'discord.js';
import { test } from 'vitest';
import { type DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended';

interface ChatInputCommandInteractionTest {
  interaction: DeepMockProxy<ChatInputCommandInteraction>;
}

export const chatInputCommandInteractionTest = test.extend<ChatInputCommandInteractionTest>({
  interaction: async ({}, use) => {
    const interaction = mockDeep<ChatInputCommandInteraction>();
    interaction.guildId = faker.string.nanoid();

    await use(interaction);

    mockReset(interaction);
  },
});
