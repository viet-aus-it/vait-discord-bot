import type { GuildMember } from 'discord.js';
import { describe, expect } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

import { chatInputCommandInteractionTest } from '../../test/fixtures/chat-input-command-interaction';
import { handleHoneypotTrigger } from './honeypot-handler';

describe('handleHoneypotTrigger', () => {
  chatInputCommandInteractionTest('should skip if member is null', async ({ message }) => {
    Object.defineProperty(message, 'member', { value: null, configurable: true });

    await handleHoneypotTrigger(message);

    expect(message.guild.members.ban).not.toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should skip if author is the bot itself', async ({ message }) => {
    const member = mockDeep<GuildMember>();
    Object.defineProperty(message, 'member', { value: member, configurable: true });
    message.author.id = 'bot-user-id';
    message.client.user!.id = 'bot-user-id';

    await handleHoneypotTrigger(message);

    expect(message.guild.members.ban).not.toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should ban user when honeypot triggered', async ({ message }) => {
    const member = mockDeep<GuildMember>();
    Object.defineProperty(message, 'member', { value: member, configurable: true });
    message.author.id = 'malicious-user';
    message.client.user!.id = 'bot-user-id';

    await handleHoneypotTrigger(message);

    expect(message.guild.members.ban).toHaveBeenCalledWith('malicious-user', {
      deleteMessageSeconds: 3600,
      reason: 'autoban - spambot',
    });
  });

  chatInputCommandInteractionTest('should handle ban failure gracefully', async ({ message }) => {
    const member = mockDeep<GuildMember>();
    Object.defineProperty(message, 'member', { value: member, configurable: true });
    message.author.id = 'malicious-user';
    message.client.user!.id = 'bot-user-id';
    message.guild.members.ban.mockRejectedValue(new Error('Missing permissions'));

    await expect(handleHoneypotTrigger(message)).resolves.not.toThrow();
  });
});
