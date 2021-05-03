import R from 'ramda';
import { Message } from 'discord.js';
import mockSomeone from '../mockSomeone';
import ask8Ball from '../8ball';
import { checkReputation } from '../thanks/checkReputation';
import { thankUser } from '../thanks/thankUser';

export interface PrefixedCommand {
  matcher: string;
  fn: (message: Message) => Promise<any>;
}

export interface PrefixedCommands {
  prefix: string;
  commands: Array<PrefixedCommand>;
}

export interface KeywordMatchCommand {
  matchers: Array<string>;
  fn: (message: Message) => Promise<any>;
}

export interface CommandConfig {
  prefixedCommands: PrefixedCommands;
  keywordMatchCommands: Array<KeywordMatchCommand>;
}

export const getDefaultConfig = (): CommandConfig => ({
  keywordMatchCommands: [],
  prefixedCommands: {
    prefix: '-',
    commands: [],
  },
});

export const initializeConfig = (rootConfig: CommandConfig) => {
  const config = R.clone(rootConfig);

  const registerPrefixedCommand = (command: PrefixedCommand) => {
    config.prefixedCommands.commands.push(command);
  };

  const registerMatchedCommand = (command: KeywordMatchCommand) => {
    config.keywordMatchCommands.push(command);
  };

  // thanks
  registerPrefixedCommand({
    matcher: 'rep',
    fn: checkReputation,
  });
  registerMatchedCommand({
    matchers: ['thank', 'thanks', 'cảm ơn'],
    fn: thankUser,
  });

  // 8ball
  registerPrefixedCommand({
    matcher: '8ball',
    fn: ask8Ball,
  });

  // mock
  registerPrefixedCommand({
    matcher: 'mock',
    fn: mockSomeone,
  });

  return config;
};
