import { CommandConfig } from './utils/index.js';
import { thankUserInMessage } from './commands/index.js';

export const getConfigs = (): CommandConfig => {
  return {
    keywordMatchCommands: [
      {
        matchers: ['thank', 'thanks', 'cảm ơn', 'cám ơn'],
        fn: thankUserInMessage,
      },
    ],
  };
};
