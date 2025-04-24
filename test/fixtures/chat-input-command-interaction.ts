import { faker } from '@faker-js/faker';
import type { ChatInputCommandInteraction, Message } from 'discord.js';
import { test } from 'vitest';
import { type DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended';

interface ChatInputCommandInteractionTest {
  interaction: DeepMockProxy<ChatInputCommandInteraction>;
  message: DeepMockProxy<Message<true>>;
}

const interaction = mockDeep<ChatInputCommandInteraction>();
const message = mockDeep<Message<true>>();

const guildId = faker.string.nanoid();

export const chatInputCommandInteractionTest = test.extend<ChatInputCommandInteractionTest>({
  interaction: async ({}, use) => {
    interaction.guildId = guildId;

    await use(interaction);

    mockReset(interaction);
  },
  message: async ({}, use) => {
    message.guildId = guildId;

    await use(message);

    mockReset(message);
  },
});
