import { ChannelType, SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { CommandHandler, Subcommand } from '../builder';
import { addAutobumpThread } from './util';

const data = new SlashCommandSubcommandBuilder()
  .setName('add')
  .setDescription('Add thread to autobump list')
  .addChannelOption((option) => option.setName('thread').setDescription('thread to be auto-bumped').setRequired(true));

export const addAutobumpThreadCommand: CommandHandler = async (interaction) => {
  const guildId = interaction.guildId!;
  const thread = interaction.options.getChannel('thread', true);

  const isThread = thread.type === ChannelType.PublicThread || thread.type === ChannelType.PrivateThread;
  if (!isThread) {
    await interaction.reply('ERROR: The channel in the input is not a thread.');
    return;
  }

  const op = await Result.safe(addAutobumpThread(guildId, thread.id));
  if (op.isErr()) {
    await interaction.reply('ERROR: Cannot save this thread to be autobumped for this server. Please try again.');
    return;
  }

  await interaction.reply(`Successfully saved setting. Thread <#${thread.id}> will be autobumped.`);
};

const command: Subcommand = {
  data,
  execute: addAutobumpThreadCommand,
};

export default command;
