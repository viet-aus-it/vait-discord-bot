import { Message } from 'discord.js';
import { logger } from '../logger';

type CommandPromise = Promise<any> | undefined;

type CommandPromises = Array<CommandPromise>;

interface KeywordMatchCommand {
  matchers: Array<string>;
  fn: (message: Message) => Promise<any>;
}

type KeywordMatchCommands = Array<KeywordMatchCommand>;

const processKeywordMatch = (
  message: Message,
  config: KeywordMatchCommands
): CommandPromises => {
  return config.map((conf) => {
    const hasKeyword = conf.matchers.some((keyword) =>
      message.content.toLowerCase().includes(keyword)
    );

    if (!hasKeyword) {
      return;
    }

    return conf.fn(message);
  });
};

export interface CommandConfig {
  keywordMatchCommands: KeywordMatchCommands;
}

export const processMessage = async (
  message: Message,
  config: CommandConfig
) => {
  const keywordPromises = processKeywordMatch(
    message,
    config.keywordMatchCommands
  );

  try {
    await Promise.all(keywordPromises);
  } catch (error) {
    logger.error('ERROR PROCESSING MESSAGE', error);
  }
};
