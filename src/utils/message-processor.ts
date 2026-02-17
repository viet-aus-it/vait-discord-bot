import { trace } from '@opentelemetry/api';
import type { Message } from 'discord.js';
import { logger } from './logger';

const tracer = trace.getTracer('discord-bot');

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
      span.setAttribute('discord.channel.id', message.channelId);
      span.setAttribute('discord.guild.id', message.guildId);
      span.setAttribute('discord.message.id', message.id);

      const keywordPromises = processKeywordMatch(message, config.keywordMatchCommands);

      try {
        await Promise.all(keywordPromises);
      } catch (error) {
        span.setAttribute('error', true);
        span.setAttribute('error.message', String(error));
        logger.error('ERROR PROCESSING MESSAGE', error);
      }
    } finally {
      span.end();
    }
  });
};
