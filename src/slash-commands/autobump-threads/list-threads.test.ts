import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedServerSettings } from '../../../test/fixtures/db-seed';
import { listAutobumpThreadsCommand } from './list-threads';

const threadId = 'thread_1234';

describe('List autobump threads', () => {
  chatInputCommandInteractionTest('Should reply with error if the server settings cannot be retrieved', async ({ interaction }) => {
    await listAutobumpThreadsCommand(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("ERROR: Cannot get list of threads from the database, maybe the server threads aren't setup yet?");
  });

  chatInputCommandInteractionTest('Should reply with empty message if no autobump thread has been set', async ({ interaction }) => {
    await seedServerSettings(interaction.guildId!);

    await listAutobumpThreadsCommand(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('ERROR: No threads have been setup for autobumping in this server');
  });

  chatInputCommandInteractionTest('Should reply with list of autobump thread if it has been set', async ({ interaction }) => {
    await seedServerSettings(interaction.guildId!, { autobumpThreads: [threadId] });

    await listAutobumpThreadsCommand(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `Here is the threads to be autobumped in this server:
- <#${threadId}>
`
    );
  });
});
