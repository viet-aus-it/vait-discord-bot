import type { Message } from 'discord.js';
import { describe, expect } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { pinMessage } from '.';
import { contextMenuCommandTest } from '../../../test/fixtures/context-menu-command-interaction';

describe('pinMessage context menu test', () => {
  contextMenuCommandTest('Should return if interaction is not message context menu command', async ({ interaction }) => {
    interaction.isMessageContextMenuCommand.mockReturnValueOnce(false);

    await pinMessage(interaction);
    expect(interaction.reply).not.toHaveBeenCalled();
  });

  contextMenuCommandTest('Should reply skipping if message is already pinned', async ({ interaction }) => {
    interaction.isMessageContextMenuCommand.mockReturnValueOnce(true);
    interaction.targetMessage.pinned = true;

    await pinMessage(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Message is already pinned. Skipping...');
  });

  contextMenuCommandTest('Should pin the message', async ({ interaction }) => {
    interaction.isMessageContextMenuCommand.mockReturnValueOnce(true);
    interaction.targetMessage.pinned = false;
    interaction.targetMessage.pin.mockResolvedValueOnce(mockDeep<Message<true>>());

    await pinMessage(interaction);
    expect(interaction.targetMessage.pin).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Message is now pinned!');
  });
});
