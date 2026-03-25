import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { setHoneypotChannelId } from '../../utils/honeypot-handler';
import { logger } from '../../utils/logger';
import { tracer } from '../../utils/tracer';
import type { SlashCommandHandler, Subcommand } from '../builder';
import { setHoneypotChannel } from './utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('honeypot-channel')
  .setDescription('ADMIN COMMAND. Set the honeypot channel to catch malicious users.')
  .addChannelOption((option) => option.setName('channel').setDescription('channel to use as honeypot').setRequired(true));

export const execute: SlashCommandHandler = async (interaction) => {
  return tracer.startActiveSpan('command.serverSettings.honeypotChannel', async (span) => {
    try {
      const guildId = interaction.guildId!;
      const channel = interaction.options.getChannel('channel', true);
      logger.info(`[set-honeypot-channel]: ${interaction.member!.user.username} is setting honeypot channel to ${channel.name}`);
      const op = await Result.safe(setHoneypotChannel(guildId, channel.id));
      if (op.isErr()) {
        logger.error(
          `[set-honeypot-channel]: ${interaction.member!.user.username} failed to set honeypot channel to ${channel.name}, ERROR: ${op.unwrapErr()}`
        );
        await interaction.reply('Cannot save this honeypot channel for this server. Please try again.');
        return;
      }

      const channelId = op.unwrap();
      setHoneypotChannelId(guildId, channelId);
      logger.info(`[set-honeypot-channel]: ${interaction.member!.user.username} successfully set honeypot channel to ${channel.name}`);
      await interaction.reply(`Successfully saved setting. Honeypot channel set to <#${channelId}>`);
    } finally {
      span.end();
    }
  });
};

const command: Subcommand = {
  data,
  execute,
};

export default command;
