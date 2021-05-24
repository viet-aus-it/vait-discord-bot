import { Message } from 'discord.js';
import { processMessage, CommandConfig } from './messageProcessor';

describe('processMessage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('process keyword matches', async () => {
    const km1 = jest.fn();
    const km2 = jest.fn();
    const km3 = jest.fn();
    const km4 = jest.fn();
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
      emojiMatchCommand: {
        matcher: ':.+:',
        fn: km3,
      },
      linkMatchCommand: {
        fn: km4,
      },
    };

    const message = {
      content: 'star this thing :sadparrot:',
    } as Message;

    await processMessage(message, config);

    expect(km1).toHaveBeenCalled();
    expect(km2).toHaveBeenCalled();
    expect(km3).toHaveBeenCalled();
    expect(km4).not.toHaveBeenCalled();
    expect(noMatch).not.toHaveBeenCalled();
  });

  describe('process embeded links and emojis', () => {
    it('process discord link matches', async () => {
      const em = jest.fn();
      const lm = jest.fn();

      const config: CommandConfig = {
        keywordMatchCommands: [],
        prefixedCommands: {
          prefix: '-',
          commands: [],
        },
        emojiMatchCommand: {
          matcher: ':.+:',
          fn: em,
        },
        linkMatchCommand: {
          fn: lm,
        },
      };

      const message = {
        content:
          'test https://discord.com/channels/836907335263060028/844572466517245954/844667107581100073',
      } as Message;

      await processMessage(message, config);

      expect(em).not.toHaveBeenCalled();
      expect(lm).toHaveBeenCalled();
    });

    it('process broken discord link', async () => {
      const km1 = jest.fn();
      const km2 = jest.fn();

      const config: CommandConfig = {
        keywordMatchCommands: [],
        prefixedCommands: {
          prefix: '-',
          commands: [],
        },
        emojiMatchCommand: {
          matcher: ':.+:',
          fn: km1,
        },
        linkMatchCommand: {
          fn: km2,
        },
      };

      const message = {
        content:
          'test https://discord.com/channels/836907335263060028/844572466517245954/',
      } as Message;

      await processMessage(message, config);

      expect(km1).not.toHaveBeenCalled();
      expect(km2).not.toHaveBeenCalled();
    });

    it('process emojis', async () => {
      const km1 = jest.fn();
      const km2 = jest.fn();

      const config: CommandConfig = {
        keywordMatchCommands: [],
        prefixedCommands: {
          prefix: '-',
          commands: [],
        },
        emojiMatchCommand: {
          matcher: ':.+:',
          fn: km1,
        },
        linkMatchCommand: {
          fn: km2,
        },
      };

      const message = {
        content: ':sadparrot:',
      } as Message;
      await processMessage(message, config);

      expect(km1).toHaveBeenCalled();
      expect(km2).not.toHaveBeenCalled();
    });

    it('does not process if there is a prefix command', async () => {
      const km1 = jest.fn(async () => ({}));
      const em = jest.fn();
      const lm = jest.fn();

      const config: CommandConfig = {
        keywordMatchCommands: [],
        prefixedCommands: {
          prefix: '-',
          commands: [{ matcher: 'km1', fn: km1 }],
        },
        emojiMatchCommand: {
          matcher: ':.+:',
          fn: em,
        },
        linkMatchCommand: {
          fn: lm,
        },
      };

      const message = {
        content:
          '-km1 https://discord.com/channels/836907335263060028/844572466517245954/844667107581100073',
      } as Message;

      await processMessage(message, config);
      expect(km1).toHaveBeenCalled();
      expect(em).not.toHaveBeenCalled();
      expect(lm).not.toHaveBeenCalled();
    });
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
});
