import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommandHandler, Subcommand } from '../builder';
import { removeAutobumpThread } from './utils';

const data = new SlashCommandSubcommandBuilder()
  .setName('remove')
  .setDescription('Remove thread from autobump list')
  .addChannelOption((option) => option.setName('thread').setDescription('thread not to be auto-bumped').setRequired(true));

export const removeAutobumpThreadCommand: SlashCommandHandler = async (interaction) => {
  const guildId = interaction.guildId!;
  const thread = interaction.options.getChannel('thread', true);
  logger.info(`[remove-autobump-thread]: Removing thread ${thread.id} from autobump list for guild ${guildId}`);

  const op = await Result.safe(removeAutobumpThread(guildId, thread.id));
  if (op.isErr()) {
    await interaction.reply(`ERROR: Cannot remove thread id <#${thread.id}> from the bump list for this server. Please try again.`);
    return;
  }

  logger.info(`[remove-autobump-thread]: Successfully removed thread ${thread.id} from autobump list for guild ${guildId}`);
  await interaction.reply(`Successfully saved setting. Thread <#${thread.id}> will not be bumped.`);
};

const command: Subcommand = {
  data,
  execute: removeAutobumpThreadCommand,
};

export default command;
