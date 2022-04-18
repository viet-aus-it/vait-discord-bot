import { CommandConfig } from './utils';
import { giveReputation } from './commands';

export const getConfigs = (): CommandConfig => {
  return {
    keywordMatchCommands: [
      {
        matchers: ['thank', 'thanks', 'cảm ơn', 'cám ơn'],
        fn: giveReputation,
      },
    ],
  };
};
