import { Message } from 'discord.js';
import { logger } from '../logger';

const keywordMatched = (content: string, keyword: string): boolean => {
  const lowerCaseContent = content.toLowerCase();
  const matchedIdx = lowerCaseContent.indexOf(keyword);

  if (matchedIdx === -1) {
    return false;
  }

  const prevIdx = matchedIdx - 1;
  const prevIdxValid = prevIdx <= 0 || !lowerCaseContent[prevIdx].match(/[a-z]/);
  const nextIdx = matchedIdx + keyword.length;
  const nextIdxValid = nextIdx >= lowerCaseContent.length || !lowerCaseContent[nextIdx].match(/[a-z]/);

  return prevIdxValid && nextIdxValid;
};

type CommandPromise = Promise<any> | undefined;

type CommandPromises = Array<CommandPromise>;

interface KeywordMatchCommand {
  matchers: Array<string>;
  fn: (message: Message) => Promise<any>;
}

type KeywordMatchCommands = Array<KeywordMatchCommand>;

const processKeywordMatch = (message: Message, config: KeywordMatchCommands): CommandPromises => {
  return config.map((conf) => {
    const hasKeyword = conf.matchers.some((keyword) => keywordMatched(message.content, keyword));

    if (!hasKeyword) {
      return;
    }

    return conf.fn(message);
  });
};

export interface CommandConfig {
  keywordMatchCommands: KeywordMatchCommands;
}

export const processMessage = async (message: Message, config: CommandConfig) => {
  const keywordPromises = processKeywordMatch(message, config.keywordMatchCommands);

  try {
    await Promise.all(keywordPromises);
  } catch (error) {
    logger.error('ERROR PROCESSING MESSAGE', error);
  }
};
