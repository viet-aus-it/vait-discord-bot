import { Collection, type GuildMember, type TextChannel } from 'discord.js';
import { describe, expect, vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { chatInputCommandInteractionTest } from '../../test/fixtures/chat-input-command-interaction';
import { handleHoneypotTrigger } from './honeypot-handler';

const mockChannels = (...channels: TextChannel[]) => {
  return new Collection(channels.map((ch) => [ch.id, ch]));
};

describe('handleHoneypotTrigger', () => {
  chatInputCommandInteractionTest('should skip if member is null', async ({ message }) => {
    Object.defineProperty(message, 'member', { value: null, configurable: true });

    await handleHoneypotTrigger(message);
  });

  chatInputCommandInteractionTest('should skip if author is a bot', async ({ message }) => {
    const member = mockDeep<GuildMember>();
    Object.defineProperty(message, 'member', { value: member, configurable: true });
    message.author.bot = true;

    await handleHoneypotTrigger(message);

    expect(member.kick).not.toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should cleanup messages and kick user', async ({ message }) => {
    const member = mockDeep<GuildMember>();
    Object.defineProperty(message, 'member', { value: member, configurable: true });
    message.author.bot = false;

    const textChannel = {
      id: 'channel123',
      isTextBased: () => true,
      messages: { fetch: vi.fn().mockResolvedValue(new Collection()) },
    } as unknown as TextChannel;

    message.guild.channels.cache.filter.mockReturnValue(mockChannels(textChannel));

    await handleHoneypotTrigger(message);

    expect(member.kick).toHaveBeenCalledWith('Honeypot triggered - detected as malicious user');
  });

  chatInputCommandInteractionTest('should delete user messages from last hour', async ({ message }) => {
    const member = mockDeep<GuildMember>();
    Object.defineProperty(message, 'member', { value: member, configurable: true });
    message.author.bot = false;
    message.author.id = 'user123';

    const recentMessage = {
      author: { id: 'user123' },
      createdTimestamp: Date.now() - 30 * 60 * 1000,
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const oldMessage = {
      author: { id: 'user123' },
      createdTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    };

    const otherUserMessage = {
      author: { id: 'otheruser' },
      createdTimestamp: Date.now() - 30 * 60 * 1000,
    };

    const textChannel = {
      id: 'channel123',
      isTextBased: () => true,
      messages: {
        fetch: vi.fn().mockResolvedValue(
          new Collection([
            ['msg1', recentMessage],
            ['msg2', oldMessage],
            ['msg3', otherUserMessage],
          ])
        ),
      },
      bulkDelete: vi.fn().mockResolvedValue(new Collection([['msg1', recentMessage]])),
    } as unknown as TextChannel;

    message.guild.channels.cache.filter.mockReturnValue(mockChannels(textChannel));

    await handleHoneypotTrigger(message);

    expect(textChannel.bulkDelete).toHaveBeenCalled();
    expect(member.kick).toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should handle kick failure gracefully', async ({ message }) => {
    const member = mockDeep<GuildMember>();
    Object.defineProperty(message, 'member', { value: member, configurable: true });
    message.author.bot = false;

    const textChannel = {
      id: 'channel123',
      isTextBased: () => true,
      messages: { fetch: vi.fn().mockResolvedValue(new Collection()) },
    } as unknown as TextChannel;

    message.guild.channels.cache.filter.mockReturnValue(mockChannels(textChannel));
    member.kick.mockRejectedValue(new Error('Cannot kick member'));

    await expect(handleHoneypotTrigger(message)).resolves.not.toThrow();
  });
});
