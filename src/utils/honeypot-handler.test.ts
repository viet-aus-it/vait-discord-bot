import { Collection, type TextChannel } from 'discord.js';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../test/fixtures/chat-input-command-interaction';
import { handleHoneypotTrigger } from './honeypot-handler';

describe('handleHoneypotTrigger', () => {
  chatInputCommandInteractionTest('should skip if member is null', async ({ message }) => {
    vi.spyOn(message, 'member', 'get').mockReturnValue(null);

    await handleHoneypotTrigger(message);

    expect(message.member?.kick).not.toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should skip if author is a bot', async ({ message }) => {
    message.author.bot = true;

    await handleHoneypotTrigger(message);

    expect(message.member?.kick).not.toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should cleanup messages and kick user', async ({ message }) => {
    const textChannel = {
      id: 'channel123',
      isTextBased: () => true,
      messages: { fetch: vi.fn().mockResolvedValue(new Collection()) },
    } as unknown as TextChannel;

    vi.spyOn(message.guild.channels.cache, 'values').mockReturnValue([textChannel].values());

    await handleHoneypotTrigger(message);

    expect(message.member?.kick).toHaveBeenCalledWith('Honeypot triggered - detected as malicious user');
  });

  chatInputCommandInteractionTest('should delete user messages from last hour', async ({ message }) => {
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

    vi.spyOn(message.guild.channels.cache, 'values').mockReturnValue([textChannel].values());

    await handleHoneypotTrigger(message);

    expect(textChannel.bulkDelete).toHaveBeenCalled();
    expect(message.member?.kick).toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should handle kick failure gracefully', async ({ message }) => {
    const textChannel = {
      id: 'channel123',
      isTextBased: () => true,
      messages: { fetch: vi.fn().mockResolvedValue(new Collection()) },
    } as unknown as TextChannel;

    vi.spyOn(message.guild.channels.cache, 'values').mockReturnValue([textChannel].values());
    vi.spyOn(message.member!, 'kick').mockRejectedValue(new Error('Cannot kick member'));

    await expect(handleHoneypotTrigger(message)).resolves.not.toThrow();
  });
});
