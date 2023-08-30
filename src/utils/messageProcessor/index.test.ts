import { Message } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import { CommandConfig, processMessage } from '.';

describe('processMessage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('process keyword matches', async () => {
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
          matchers: ['nein'],
          fn: noMatch,
        },
      ],
    };

    const message = {
      content: 'star this thing :sadparrot:',
    } as Message;

    await processMessage(message, config);

    expect(km1).toHaveBeenCalled();
    expect(km2).toHaveBeenCalled();
    expect(noMatch).not.toHaveBeenCalled();
  });
});
