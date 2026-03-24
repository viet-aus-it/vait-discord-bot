import { faker } from '@faker-js/faker';
import type { ChatInputCommandInteraction, Message, PublicThreadChannel, TextChannel } from 'discord.js';
import { test } from 'vitest';
import { type DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended';

interface ChatInputCommandInteractionTest {
  interaction: DeepMockProxy<ChatInputCommandInteraction>;
  message: DeepMockProxy<Message<true>>;
  thread: DeepMockProxy<PublicThreadChannel>;
  channel: DeepMockProxy<TextChannel>;
}

const interaction = mockDeep<ChatInputCommandInteraction>();
const message = mockDeep<Message<true>>();
const thread = mockDeep<PublicThreadChannel>();
const channel = mockDeep<TextChannel>();

const guildId = `guild_${faker.string.nanoid()}`;
const threadId = `thread_${faker.string.nanoid()}`;
const channelId = `channel_${faker.string.nanoid()}`;

export const chatInputCommandInteractionTest = test.extend<ChatInputCommandInteractionTest>({
  interaction: async ({}, use) => {
    interaction.guildId = guildId;
    interaction.guild!.id = guildId;

    await use(interaction);

    mockReset(interaction);
  },
  message: async ({}, use) => {
    message.guildId = guildId;

    await use(message);

    mockReset(message);
  },
  thread: async ({}, use) => {
    thread.id = threadId;

    await use(thread);

    mockReset(thread);
  },
  channel: async ({}, use) => {
    channel.id = channelId;

    await use(channel);

    mockReset(channel);
  },
});
