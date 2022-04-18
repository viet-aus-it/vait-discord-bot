import { Message } from 'discord.js';
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
