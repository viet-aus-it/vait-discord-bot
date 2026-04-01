import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';

import { setHoneypotChannelId } from '../../utils/honeypot-handler';
import { logger } from '../../utils/logger';
import { recordSpanError, setSpanAttributes } from '../../utils/tracer';
import type { SlashCommandHandler, Subcommand } from '../builder';
import { setHoneypotChannel } from './utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('honeypot-channel')
  .setDescription('ADMIN COMMAND. Set the honeypot channel to catch malicious users.')
  .addChannelOption((option) => option.setName('channel').setDescription('channel to use as honeypot').setRequired(true));

export const execute: SlashCommandHandler = async (interaction) => {
  const guildId = interaction.guildId!;
  const channel = interaction.options.getChannel('channel', true);
  logger.info(`[set-honeypot-channel]: ${interaction.member!.user.username} is setting honeypot channel to ${channel.name}`);
  const op = await Result.safe(setHoneypotChannel(guildId, channel.id));
  if (op.isErr()) {
    recordSpanError(op.unwrapErr(), 'err-settings-honeypot-save-failed');
    logger.error(`[set-honeypot-channel]: ${interaction.member!.user.username} failed to set honeypot channel to ${channel.name}`, op.unwrapErr());
    await interaction.reply('Cannot save this honeypot channel for this server. Please try again.');
    return;
  }

  const channelId = op.unwrap();
  setSpanAttributes({ 'bot.settings.type': 'honeypot-channel', 'bot.settings.channel_id': channelId });
  setHoneypotChannelId(guildId, channelId);
  logger.info(`[set-honeypot-channel]: ${interaction.member!.user.username} successfully set honeypot channel to ${channel.name}`);
  await interaction.reply(`Successfully saved setting. Honeypot channel set to <#${channelId}>`);
};

const command: Subcommand = {
  data,
  execute,
};

export default command;
