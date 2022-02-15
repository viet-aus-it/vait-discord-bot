import { Message } from 'discord.js';
import mockConsole from 'jest-mock-console';
import { processMessage, CommandConfig } from '.';

describe('processMessage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('process keyword matches', async () => {
    const km1 = jest.fn();
    const km2 = jest.fn();
    const noMatch = jest.fn();

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
      prefixedCommands: {
        prefix: '-',
        commands: [],
      },
    };

    const message = {
      content: 'star this thing :sadparrot:',
    } as Message;

    await processMessage(message, config);

    expect(km1).toHaveBeenCalled();
    expect(km2).toHaveBeenCalled();
    expect(noMatch).not.toHaveBeenCalled();
  });

  describe('process prefix matches', () => {
    it('process prefix matches with correct prefix', async () => {
      const km1 = jest.fn();
      const km2 = jest.fn();
      const km3 = jest.fn();
      const km4 = jest.fn();
      const config: CommandConfig = {
        keywordMatchCommands: [],
        prefixedCommands: {
          prefix: '-',
          commands: [
            { matcher: 'km1', fn: km1 },
            { matcher: 'km2', fn: km2 },
          ],
        },
      };

      const message = {
        content: '-km2 star this thing',
      } as Message;

      await processMessage(message, config);

      expect(km1).not.toHaveBeenCalled();
      expect(km2).toHaveBeenCalled();
      expect(km3).not.toHaveBeenCalled();
      expect(km4).not.toHaveBeenCalled();
    });

    it('does not process prefix matches with wrong prefix', async () => {
      const km1 = jest.fn();
      const km2 = jest.fn();
      const km3 = jest.fn();
      const km4 = jest.fn();

      const config: CommandConfig = {
        keywordMatchCommands: [],
        prefixedCommands: {
          prefix: '/',
          commands: [
            { matcher: 'km1', fn: km1 },
            { matcher: 'km2', fn: km2 },
          ],
        },
        emojiMatchCommand: {
          matcher: ':.+:',
          fn: km3,
        },
        linkMatchCommand: {
          fn: km4,
        },
      };

      const message = {
        content: '-km2 star this thing',
      } as Message;

      await processMessage(message, config);

      expect(km1).not.toHaveBeenCalled();
      expect(km2).not.toHaveBeenCalled();
      expect(km3).not.toHaveBeenCalled();
      expect(km4).not.toHaveBeenCalled();
    });
  });

  it('should handle message processing error with console error', async () => {
    mockConsole();
    const km1 = jest.fn(() => Promise.reject(new Error('Synthetic Error')));
    const km3 = jest.fn();
    const km4 = jest.fn();
    const config: CommandConfig = {
      keywordMatchCommands: [],
      prefixedCommands: {
        prefix: '-',
        commands: [{ matcher: 'km1', fn: km1 }],
      },
      emojiMatchCommand: {
        matcher: ':.+:',
        fn: km3,
      },
      linkMatchCommand: {
        fn: km4,
      },
    };

    const message = {
      content: '-km1 star this thing',
    } as Message;

    await processMessage(message, config);

    expect(km1).toHaveBeenCalled();
    expect(km3).not.toHaveBeenCalled();
    expect(km4).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
