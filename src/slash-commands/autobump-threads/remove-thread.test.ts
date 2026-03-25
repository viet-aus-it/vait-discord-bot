import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedServerSettings } from '../../../test/fixtures/db-seed';
import { removeAutobumpThreadCommand } from './remove-thread';

describe('Remove autobump thread', () => {
  chatInputCommandInteractionTest('Should reply with error if it cannot be saved into the database', async ({ interaction, thread }) => {
    interaction.options.getChannel.mockReturnValueOnce(thread);

    await removeAutobumpThreadCommand(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(`ERROR: Cannot remove thread id <#${thread.id}> from the bump list for this server. Please try again.`);
  });

  chatInputCommandInteractionTest('Should reply with success message if it can be saved into the database', async ({ interaction, thread }) => {
    await seedServerSettings(interaction.guildId!, { autobumpThreads: [thread.id] });
    interaction.options.getChannel.mockReturnValueOnce(thread);

    await removeAutobumpThreadCommand(interaction);
    expect(interaction.reply).toBeCalledWith(`Successfully saved setting. Thread <#${thread.id}> will not be bumped.`);
  });
});
