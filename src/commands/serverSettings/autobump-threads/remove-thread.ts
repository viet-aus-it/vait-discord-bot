import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Subcommand, CommandHandler } from '../../builder';
import { removeAutobumpThread } from './util';

const data = new SlashCommandSubcommandBuilder()
  .setName('remove-autobump-thread')
  .setDescription('Remove thread from autobump list')
  .addChannelOption((option) =>
    option
      .setName('thread')
      .setDescription('thread not to be auto-bumped')
      .setRequired(true)
  );

export const removeAutobumpThreadCommand: CommandHandler = async (
  interaction
) => {
  const guildId = interaction.guildId!;
  const thread = interaction.options.getChannel('thread', true);

  const op = await removeAutobumpThread(guildId, thread.id);
  if (!op.success) {
    await interaction.reply(
      'ERROR: Cannot remove this thread from the bump list for this server. Please try again.'
    );
    return;
  }

  await interaction.reply(
    `Successfully saved setting. Thread <#${thread.id}> will not be bumped.`
  );
};

const command: Subcommand = {
  data,
  execute: removeAutobumpThreadCommand,
};

export default command;
