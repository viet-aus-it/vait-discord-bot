import { performance } from 'node:perf_hooks';
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
      const start = performance.now();

      span.setAttribute('discord.channel.id', message.channelId);
      span.setAttribute('discord.guild.id', message.guildId);
      span.setAttribute('discord.message.id', message.id);
      span.setAttribute('discord.user.id', message.author.id);

      const honeypotChannelId = getHoneypotChannelId(message.guildId);
      if (honeypotChannelId && message.channelId === honeypotChannelId) {
        span.setAttribute('message.processed', true);
        span.setAttribute('message.honeypot', true);
        const result = await Result.safe(handleHoneypotTrigger(message));
        if (result.isErr()) {
          recordSpanError(span, result.unwrapErr(), 'err-honeypot-trigger-failed');
          logger.error('[honeypot]: Error processing honeypot trigger', { error: result.unwrapErr() });
        }
        span.setAttribute('process.duration_ms', performance.now() - start);
        return;
      }

      const keywordPromises = processKeywordMatch(message, config.keywordMatchCommands);
      const hasKeywordMatch = keywordPromises.some((p) => p !== undefined);
      span.setAttribute('message.processed', hasKeywordMatch);

      try {
        await Promise.all(keywordPromises);
      } catch (error) {
        recordSpanError(span, error, 'err-keyword-processing-failed');
        logger.error('ERROR PROCESSING MESSAGE', error);
      }

      span.setAttribute('process.duration_ms', performance.now() - start);
    } finally {
      span.end();
    }
  });
};
