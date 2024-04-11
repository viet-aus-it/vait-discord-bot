import { ChannelType, SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommandHandler, Subcommand } from '../builder';
import { addAutobumpThread } from './utils';

const data = new SlashCommandSubcommandBuilder()
  .setName('add')
  .setDescription('Add thread to autobump list')
  .addChannelOption((option) => option.setName('thread').setDescription('thread to be auto-bumped').setRequired(true));

export const addAutobumpThreadCommand: SlashCommandHandler = async (interaction) => {
  const guildId = interaction.guildId!;
  const thread = interaction.options.getChannel('thread', true);
  logger.info(`[add-autobump-thread]: Adding thread ${thread.id} to autobump list for guild ${guildId}`);

  const isThread = thread.type === ChannelType.PublicThread || thread.type === ChannelType.PrivateThread;
  if (!isThread) {
    logger.error(`[add-autobump-thread]: The channel ${thread.id} of ${guildId} is not a thread.`);
    await interaction.reply(`ERROR: The channel <#${thread.id}> is not a thread.`);
    return;
  }

  const op = await Result.safe(addAutobumpThread(guildId, thread.id));
  if (op.isErr()) {
    logger.error(`[add-autobump-thread]: Cannot save thread ${thread.id} to be autobumped for guild ${guildId}`);
    await interaction.reply('ERROR: Cannot save this thread to be autobumped for this server. Please try again.');
    return;
  }

  logger.info(`[add-autobump-thread]: Successfully saved thread ${thread.id} to be autobumped for guild ${guildId}`);
  await interaction.reply(`Successfully saved setting. Thread <#${thread.id}> will be autobumped.`);
};

const command: Subcommand = {
  data,
  execute: addAutobumpThreadCommand,
};

export default command;
