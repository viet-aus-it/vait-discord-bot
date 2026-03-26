import type { Message } from 'discord.js';
import { Result } from 'oxide.ts';
import { getHoneypotChannelId, handleHoneypotTrigger } from './honeypot-handler';
import { logger } from './logger';
import { recordSpanError, tracer } from './tracer';

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
  return tracer.startActiveSpan('processMessage', async (span) => {
    try {
      span.setAttribute('messaging.system', 'discord');
      span.setAttribute('messaging.operation.type', 'process');
      span.setAttribute('messaging.destination.name', message.channelId);
      span.setAttribute('messaging.message.id', message.id);
      span.setAttribute('discord.guild.id', message.guildId);
      span.setAttribute('enduser.id', message.author.id);

      const honeypotChannelId = getHoneypotChannelId(message.guildId);
      if (honeypotChannelId && message.channelId === honeypotChannelId) {
        span.setAttribute('discord.message.processed', true);
        span.setAttribute('discord.message.honeypot', true);
        const result = await Result.safe(handleHoneypotTrigger(message));
        if (result.isErr()) {
          recordSpanError(span, result.unwrapErr(), 'err-honeypot-trigger-failed');
          logger.error('[honeypot]: Error processing honeypot trigger', result.unwrapErr());
        }
        return;
      }

      const keywordPromises = processKeywordMatch(message, config.keywordMatchCommands);
      const hasKeywordMatch = keywordPromises.some((p) => p !== undefined);
      span.setAttribute('discord.message.processed', hasKeywordMatch);

      try {
        await Promise.all(keywordPromises);
      } catch (error) {
        recordSpanError(span, error, 'err-keyword-processing-failed');
        logger.error('ERROR PROCESSING MESSAGE', error);
      }
    } finally {
      span.end();
    }
  });
};
