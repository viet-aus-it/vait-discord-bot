import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../test/fixtures/chat-input-command-interaction';
import { type CommandConfig, processMessage } from './message-processor';

describe('processMessage', () => {
  chatInputCommandInteractionTest('process keyword matches', async ({ message, channel }) => {
    const km1 = vi.fn();
    const km2 = vi.fn();
    const noMatch = vi.fn();

    const config: CommandConfig = {
      keywordMatchCommands: [
        {
          matchers: ['litte', 'star'],
          fn: km1,
        },
        {
          matchers: ['star'],
          fn: km2,
        },
        {
          matchers: ['nein', 'sta', 'his', 'thin'],
          fn: noMatch,
        },
      ],
    };

    message.content = 'star this thing :sadparrot:';
    message.channelId = channel.id;
    message.id = 'test-message-id';
    message.author.id = 'test-author-id';

    await processMessage(message, config);

    expect(km1).toHaveBeenCalled();
    expect(km2).toHaveBeenCalled();
    expect(noMatch).not.toHaveBeenCalled();
  });
});
