import type { Guild, Message, TextChannel } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDbClient } from '../clients';
import { logger } from './logger';

const honeypotChannels = new Map<string, string>();

export const getHoneypotChannelId = (guildId: string): string | undefined => {
  return honeypotChannels.get(guildId);
};

export const setHoneypotChannelId = (guildId: string, channelId: string): void => {
  honeypotChannels.set(guildId, channelId);
};

export const loadHoneypotChannels = async (): Promise<void> => {
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
};

const ONE_HOUR_MS = 60 * 60 * 1000;
const BULK_DELETE_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;
const MESSAGE_FETCH_LIMIT = 100;

const deleteMessagesByUser = async (channel: TextChannel, userId: string, since: number): Promise<number> => {
  const fetched = await channel.messages.fetch({ limit: MESSAGE_FETCH_LIMIT });
  const userMessages = fetched.filter((msg) => msg.author.id === userId && msg.createdTimestamp >= since);

  if (userMessages.size === 0) {
    return 0;
  }

  const now = Date.now();
  const [bulkDeletable, notBulkDeletable] = userMessages.partition((msg) => now - msg.createdTimestamp < BULK_DELETE_THRESHOLD_MS);

  let deletedCount = 0;

  if (bulkDeletable.size > 0) {
    const result = await Result.safe(channel.bulkDelete(bulkDeletable, true));
    if (result.isOk()) {
      deletedCount += bulkDeletable.size;
    }
  }

  for (const msg of notBulkDeletable.values()) {
    const deleteResult = await Result.safe(msg.delete());
    if (deleteResult.isOk()) {
      deletedCount += 1;
    }
  }

  return deletedCount;
};

const cleanupUserMessages = async (guild: Guild, userId: string): Promise<number> => {
  const since = Date.now() - ONE_HOUR_MS;
  const channels = guild.channels.cache.filter((ch): ch is TextChannel => ch.isTextBased() && 'messages' in ch);

  const results = await Promise.allSettled([...channels.values()].map((channel) => deleteMessagesByUser(channel, userId, since)));

  return results.reduce((total, result) => (result.status === 'fulfilled' ? total + result.value : total), 0);
};

export const handleHoneypotTrigger = async (message: Message<true>): Promise<void> => {
  const { guild, author, member } = message;

  if (!member) {
    return;
  }

  if (author.bot) {
    return;
  }

  logger.info(`[honeypot]: User ${author.username} (${author.id}) triggered honeypot in guild ${guild.name}`);

  const [cleanupResult, kickResult] = await Promise.allSettled([
    cleanupUserMessages(guild, author.id),
    member.kick('Honeypot triggered - detected as malicious user'),
  ]);

  if (cleanupResult.status === 'fulfilled') {
    logger.info(`[honeypot]: Deleted ${cleanupResult.value} messages from ${author.username}`);
  } else {
    logger.error(`[honeypot]: Failed to cleanup messages for ${author.username}`, cleanupResult.reason);
  }

  if (kickResult.status === 'fulfilled') {
    logger.info(`[honeypot]: Kicked ${author.username} from guild ${guild.name}`);
  } else {
    logger.error(`[honeypot]: Failed to kick ${author.username}`, kickResult.reason);
  }
};
