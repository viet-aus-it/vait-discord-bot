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

const deleteMessagesByUser = async (channel: TextChannel, userId: string, since: number): Promise<number> => {
  const fetched = await channel.messages.fetch({ limit: 100 });
  const userMessages = fetched.filter((msg) => msg.author.id === userId && msg.createdTimestamp >= since);

  if (userMessages.size === 0) {
    return 0;
  }

  const bulkDeletable = userMessages.filter((msg) => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000);

  const notBulkDeletable = userMessages.filter((msg) => Date.now() - msg.createdTimestamp >= 14 * 24 * 60 * 60 * 1000);

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
  let totalDeleted = 0;

  const channels = guild.channels.cache.filter((ch): ch is TextChannel => ch.isTextBased() && 'messages' in ch);

  for (const channel of channels.values()) {
    const result = await Result.safe(deleteMessagesByUser(channel, userId, since));
    if (result.isOk()) {
      totalDeleted += result.unwrap();
    }
  }

  return totalDeleted;
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

  const cleanupResult = await Result.safe(cleanupUserMessages(guild, author.id));
  if (cleanupResult.isOk()) {
    const deletedCount = cleanupResult.unwrap();
    logger.info(`[honeypot]: Deleted ${deletedCount} messages from ${author.username}`);
  } else {
    logger.error(`[honeypot]: Failed to cleanup messages for ${author.username}`, cleanupResult.unwrapErr());
  }

  const kickResult = await Result.safe(member.kick('Honeypot triggered - detected as malicious user'));
  if (kickResult.isOk()) {
    logger.info(`[honeypot]: Kicked ${author.username} from guild ${guild.name}`);
  } else {
    logger.error(`[honeypot]: Failed to kick ${author.username}`, kickResult.unwrapErr());
  }
};
