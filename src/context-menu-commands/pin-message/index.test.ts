import type { Message } from 'discord.js';
import { describe, expect } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { contextMenuCommandTest } from '../../../test/fixtures/context-menu-command-interaction';
import { pinMessageCommand } from '.';

describe('pinMessage context menu test', () => {
  contextMenuCommandTest('Should return if interaction is not message context menu command', async ({ interaction }) => {
    interaction.isMessageContextMenuCommand.mockReturnValueOnce(false);

    await pinMessageCommand(interaction);
    expect(interaction.reply).not.toHaveBeenCalled();
  });

  contextMenuCommandTest('Should unpin if message is already pinned', async ({ interaction }) => {
    interaction.isMessageContextMenuCommand.mockReturnValueOnce(true);
    interaction.targetMessage.pinned = true;
    interaction.targetMessage.pin.mockResolvedValueOnce(mockDeep<Message<true>>());
    interaction.targetMessage.unpin.mockResolvedValueOnce(mockDeep<Message<true>>());

    await pinMessageCommand(interaction);
    expect(interaction.targetMessage.unpin).toHaveBeenCalledOnce();
    expect(interaction.targetMessage.pin).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Message is now unpinned!');
  });

  contextMenuCommandTest('Should pin the message', async ({ interaction }) => {
    interaction.isMessageContextMenuCommand.mockReturnValueOnce(true);
    interaction.targetMessage.pinned = false;
    interaction.targetMessage.pin.mockResolvedValueOnce(mockDeep<Message<true>>());
    interaction.targetMessage.unpin.mockResolvedValueOnce(mockDeep<Message<true>>());

    await pinMessageCommand(interaction);
    expect(interaction.targetMessage.pin).toHaveBeenCalledOnce();
    expect(interaction.targetMessage.unpin).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Message is now pinned!');
  });
});
