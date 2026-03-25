import type { Message } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDbClient } from '../clients';
import { logger } from './logger';
import { tracer } from './tracer';

const honeypotChannels = new Map<string, string>();

export const getHoneypotChannelId = (guildId: string): string | undefined => {
  return honeypotChannels.get(guildId);
};

export const setHoneypotChannelId = (guildId: string, channelId: string): void => {
  honeypotChannels.set(guildId, channelId);
};

export const loadHoneypotChannels = async (): Promise<void> => {
  return tracer.startActiveSpan('honeypot.loadChannels', async (span) => {
    try {
      const db = getDbClient();
      const settings = await db.serverChannelsSettings.findMany({
        where: { honeypotChannel: { not: null } },
        select: { guildId: true, honeypotChannel: true },
      });

      for (const setting of settings) {
        if (setting.honeypotChannel) {
          honeypotChannels.set(setting.guildId, setting.honeypotChannel);
        }
      }
    } finally {
      span.end();
    }
  });
};

const BAN_DELETE_WINDOW_SECONDS = 3600;

export const handleHoneypotTrigger = async (message: Message<true>): Promise<void> => {
  return tracer.startActiveSpan('honeypot.trigger', async (span) => {
    const { guild, author, member } = message;
    span.setAttribute('user.id', author.id);
    span.setAttribute('guild.id', guild.id);

    try {
      if (!member) {
        return;
      }

      if (author.id === message.client.user?.id) {
        return;
      }

      logger.info(`[honeypot]: User ${author.username} (${author.id}) triggered honeypot in guild ${guild.name}`);

      const result = await Result.safe(
        guild.members.ban(author.id, {
          deleteMessageSeconds: BAN_DELETE_WINDOW_SECONDS,
          reason: 'autoban - spambot',
        })
      );

      if (result.isOk()) {
        logger.info(`[honeypot]: Banned ${author.username} from guild ${guild.name}`);
      } else {
        logger.error(`[honeypot]: Failed to ban ${author.username}`, { error: result.unwrapErr() });
      }
    } finally {
      span.end();
    }
  });
};
