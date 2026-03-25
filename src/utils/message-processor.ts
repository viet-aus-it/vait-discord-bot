import { performance } from 'node:perf_hooks';
import type { Message } from 'discord.js';
import { Result } from 'oxide.ts';
import { getHoneypotChannelId, handleHoneypotTrigger } from './honeypot-handler';
import { logger } from './logger';
import { tracer } from './tracer';

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

const willProcess = (message: Message<true>, config: CommandConfig): boolean => {
  const honeypotChannelId = getHoneypotChannelId(message.guildId);
  if (honeypotChannelId && message.channelId === honeypotChannelId) return true;
  return config.keywordMatchCommands.some((conf) => conf.matchers.some((keyword) => keywordMatched(message.content, keyword)));
};

export const processMessage = async (message: Message<true>, config: CommandConfig): Promise<void> => {
  const shouldProcess = willProcess(message, config);

  return tracer.startActiveSpan('processMessage', async (span) => {
    try {
      const start = performance.now();

      // Wide event: service metadata
      span.setAttribute('service.version', '1.0.0');
      span.setAttribute('service.environment', process.env.NODE_ENV ?? 'development');

      // Wide event: discord context
      span.setAttribute('discord.channel.id', message.channelId);
      span.setAttribute('discord.guild.id', message.guildId);
      span.setAttribute('discord.message.id', message.id);
      span.setAttribute('discord.user.id', message.author.id);
      span.setAttribute('message.processed', shouldProcess);

      const honeypotChannelId = getHoneypotChannelId(message.guildId);
      if (honeypotChannelId && message.channelId === honeypotChannelId) {
        span.setAttribute('message.honeypot', true);
        const result = await Result.safe(handleHoneypotTrigger(message));
        if (result.isErr()) {
          span.setAttribute('error', true);
          span.setAttribute('error.message', String(result.unwrapErr()));
          span.setAttribute('error.slug', 'err-honeypot-trigger-failed');
          logger.error('[honeypot]: Error processing honeypot trigger', { error: result.unwrapErr() });
        }
        span.setAttribute('process.duration_ms', performance.now() - start);
        return;
      }

      const keywordPromises = processKeywordMatch(message, config.keywordMatchCommands);
      span.setAttribute(
        'message.keyword_matched',
        keywordPromises.some((p) => p !== undefined)
      );

      try {
        await Promise.all(keywordPromises);
      } catch (error) {
        span.setAttribute('error', true);
        span.setAttribute('error.message', String(error));
        span.setAttribute('error.slug', 'err-keyword-processing-failed');
        logger.error('ERROR PROCESSING MESSAGE', error);
      }

      span.setAttribute('process.duration_ms', performance.now() - start);
    } finally {
      span.end();
    }
  });
};
