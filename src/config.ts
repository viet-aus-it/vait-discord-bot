import { ClientUser } from 'discord.js';
import { CommandConfig } from './utils';
import {
  ask8Ball,
  danhSomeone,
  mockSomeone,
  giveReputation,
  takeReputation,
  setReputation,
  checkReputation,
  getQuoteOfTheDay,
  animatedEmoji,
  embedLink,
  createPoll,
  cowsay,
  weather,
  insult,
} from './commands';

export const getConfigs = (botUser: ClientUser): CommandConfig => ({
  prefixedCommands: {
    prefix: '-',
    commands: [
      { matcher: 'rep', fn: checkReputation },
      { matcher: 'giverep', fn: giveReputation },
      { matcher: 'gr', fn: giveReputation },
      { matcher: 'takerep', fn: takeReputation },
      { matcher: 'tr', fn: takeReputation },
      { matcher: 'setrep', fn: setReputation },
      { matcher: 'sr', fn: setReputation },
      { matcher: '8ball', fn: ask8Ball },
      { matcher: 'mock', fn: mockSomeone },
      {
        matcher: 'hit',
        fn: (message) => danhSomeone(message, botUser.id),
      },
      { matcher: 'qotd', fn: getQuoteOfTheDay },
      { matcher: 'poll', fn: createPoll },
      { matcher: 'cowsay', fn: cowsay },
      { matcher: 'weather', fn: weather },
      { matcher: 'insult', fn: insult },
    ],
  },
  keywordMatchCommands: [
    {
      matchers: ['thank', 'thanks', 'cảm ơn', 'cám ơn'],
      fn: giveReputation,
    },
  ],
  emojiMatchCommand: {
    matcher: ':.+:',
    fn: animatedEmoji,
  },
  linkMatchCommand: {
    fn: embedLink,
  },
});
