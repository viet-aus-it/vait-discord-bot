import { thankUserInMessage } from './slash-commands/reputation/give-reputation';
import type { CommandConfig } from './utils/message-processor';

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
          'congratulations',
          'congrats',
          'congratz',
        ],
        fn: thankUserInMessage,
      },
    ],
  };
};
