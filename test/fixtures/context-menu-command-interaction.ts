import type { MessageContextMenuCommandInteraction } from 'discord.js';
import { test } from 'vitest';
import { type DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended';

interface ContextMenuCommandTest {
  interaction: DeepMockProxy<MessageContextMenuCommandInteraction>;
}

export const contextMenuCommandTest = test.extend<ContextMenuCommandTest>({
  interaction: async ({}, use) => {
    const interaction = mockDeep<MessageContextMenuCommandInteraction>();

    await use(interaction);

    mockReset(interaction);
  },
});
