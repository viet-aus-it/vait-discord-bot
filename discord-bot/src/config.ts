import { ClientUser } from 'discord.js';
import { CommandConfig } from './utils/messageProcessor';

import ask8Ball from './commands/8ball';
import danhSomeone from './commands/danhSomeone';
import mockSomeone from './commands/mockSomeone';
import { thankUser, checkReputation } from './commands/thanks';
import getQuoteOfTheDay from './commands/quoteOfTheDay';
import animatedEmoji from './commands/animatedEmoji';

export const getConfigs = (botUser: ClientUser): CommandConfig => ({
  prefixedCommands: {
    prefix: '-',
    commands: [
      { matcher: 'rep', fn: checkReputation },
      { matcher: '8ball', fn: ask8Ball },
      { matcher: 'mock', fn: mockSomeone },
      {
        matcher: 'hit',
        fn: (message) => danhSomeone(message, botUser.id),
      },
      { matcher: 'qotd', fn: getQuoteOfTheDay },
    ],
  },
  keywordMatchCommands: [
    {
      matchers: ['thank', 'thanks', 'cảm ơn', 'cám ơn'],
      fn: thankUser,
    },
  ],
  emojiMatchCommand: {
    matcher: ':.+:',
    fn: animatedEmoji,
  },
});
