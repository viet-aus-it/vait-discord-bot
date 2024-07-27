import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { Message } from 'discord.js';
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
      return;
    }

    return conf.fn(message);
  });
};

export interface CommandConfig {
  keywordMatchCommands: KeywordMatchCommands;
}

export const processMessage = async (message: Message<true>, config: CommandConfig): Promise<void> => {
  const tracer = trace.getTracer('discord-bot');
  return tracer.startActiveSpan('process-message', async (span) => {
    span.setStatus({
      code: SpanStatusCode.UNSET,
      message: 'Processing message',
    });

    const keywordPromises = processKeywordMatch(message, config.keywordMatchCommands);

    try {
      await Promise.all(keywordPromises);

      span.setStatus({
        code: SpanStatusCode.OK,
        message: 'Finish processing message',
      });
      span.end();
    } catch (error) {
      logger.error('ERROR PROCESSING MESSAGE', error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Error processing message',
      });
      span.setAttribute('app.error', (error as Error).toString());
      span.end();
    }
  });
};
