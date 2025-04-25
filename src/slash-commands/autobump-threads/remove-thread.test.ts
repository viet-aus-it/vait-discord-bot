import { describe, expect, it, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { removeAutobumpThreadCommand } from './remove-thread';
import { removeAutobumpThread } from './utils';

vi.mock('./utils');
const mockRemoveAutobumpThread = vi.mocked(removeAutobumpThread);

describe('Add autobump thread', () => {
  chatInputCommandInteractionTest('Should reply with error if it cannot be saved into the database', async ({ interaction, thread }) => {
    interaction.options.getChannel.mockReturnValueOnce(thread);
    mockRemoveAutobumpThread.mockRejectedValueOnce(new Error('Synthetic Error'));

    await removeAutobumpThreadCommand(interaction);
    expect(interaction.reply).toBeCalledWith(`ERROR: Cannot remove thread id <#${thread.id}> from the bump list for this server. Please try again.`);
    expect(mockRemoveAutobumpThread).toBeCalled();
  });

  chatInputCommandInteractionTest('Should reply with success message if it can be saved into the database', async ({ interaction, thread }) => {
    interaction.options.getChannel.mockReturnValueOnce(thread);
    mockRemoveAutobumpThread.mockResolvedValueOnce([thread.id]);

    await removeAutobumpThreadCommand(interaction);
    expect(interaction.reply).toBeCalledWith(`Successfully saved setting. Thread <#${thread.id}> will not be bumped.`);
    expect(mockRemoveAutobumpThread).toBeCalled();
  });
});
