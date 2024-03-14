import type { ContextMenuCommandInteraction, MessageContextMenuCommandInteraction } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { pinMessage } from '.';

describe('pinMessage context menu test', () => {
  it('Should return if interaction is not message context menu command', async () => {
    const mockInteraction = mockDeep<ContextMenuCommandInteraction>();
    mockInteraction.isMessageContextMenuCommand.mockReturnValueOnce(false);

    await pinMessage(mockInteraction as ContextMenuCommandInteraction);
    expect(mockInteraction.reply).not.toHaveBeenCalled();
  });

  it('Should reply skipping if message is already pinned', async () => {
    const mockInteraction = mockDeep<MessageContextMenuCommandInteraction>();
    mockInteraction.isMessageContextMenuCommand.mockReturnValueOnce(true);
    mockInteraction.targetMessage.pinned = true;

    await pinMessage(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('Message is already pinned. Skipping...');
  });

  it('Should pin the message', async () => {
    const mockInteraction = mockDeep<MessageContextMenuCommandInteraction>();
    mockInteraction.isMessageContextMenuCommand.mockReturnValueOnce(true);
    mockInteraction.targetMessage.pinned = false;

    await pinMessage(mockInteraction);
    expect(mockInteraction.targetMessage.pin).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('Message is now pinned!');
  });
});
