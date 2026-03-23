import type { Message } from 'discord.js';
import { Result } from 'oxide.ts';
import { getHoneypotChannelId, handleHoneypotTrigger } from './honeypot-handler';
import { logger } from './logger';

const keywordMatched = (sentence: string, keyword: string): boolean => {
  const regex = new RegExp(`\\b${keyword}\\b`, 'i');
  return regex.test(sentence);
};

type CommandPromise = Promise<void> | void;

type CommandPromises = Array<CommandPromise>;

interface KeywordMatchCommand {
  matchers: Array<string>;
  fn: (message: Message<true>) => Promise<void>;
}

type KeywordMatchCommands = Array<KeywordMatchCommand>;

const processKeywordMatch = (message: Message<true>, config: KeywordMatchCommands): CommandPromises => {
  return config.map((conf) => {
    const hasKeyword = conf.matchers.some((keyword) => keywordMatched(message.content, keyword));

    if (!hasKeyword) {
      return undefined;
    }

    return conf.fn(message);
  });
};

export interface CommandConfig {
  keywordMatchCommands: KeywordMatchCommands;
}

export const processMessage = async (message: Message<true>, config: CommandConfig): Promise<void> => {
  const honeypotChannelId = getHoneypotChannelId(message.guildId);
  if (honeypotChannelId && message.channelId === honeypotChannelId) {
    const result = await Result.safe(handleHoneypotTrigger(message));
    if (result.isErr()) {
      logger.error('[honeypot]: Error processing honeypot trigger', result.unwrapErr());
    }
    return;
  }

  const keywordPromises = processKeywordMatch(message, config.keywordMatchCommands);

  try {
    await Promise.all(keywordPromises);
  } catch (error) {
    logger.error('ERROR PROCESSING MESSAGE', error);
  }
};
