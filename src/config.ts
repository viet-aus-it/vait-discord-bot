import { CommandConfig } from './utils';
import { thankUserInMessage } from './commands';

export const getConfigs = (): CommandConfig => {
  return {
    keywordMatchCommands: [
      {
        matchers: [
          'thank',
          'thanks',
          'cảm ơn',
          'cám ơn',
          'happy birthday',
          'hpbd',
          'chúc mừng sinh nhật',
          'xia xia',
          'arigato',
          'komawo',
          'kamsahamnida',
          'gracias',
          'merci',
        ],
        fn: thankUserInMessage,
      },
    ],
  };
};
