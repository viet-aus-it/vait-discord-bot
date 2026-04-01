import type { Span } from '@opentelemetry/api';
import type { Message } from 'discord.js';
import { Result } from 'oxide.ts';

import { getHoneypotChannelId, handleHoneypotTrigger } from './honeypot-handler';
import { logger } from './logger';
import { recordSpanError, tracer } from './tracer';

const keywordMatched = (sentence: string, keyword: string): boolean => {
  const regex = new RegExp(`\\b${keyword}\\b`, 'i');
  return regex.test(sentence);
};

interface KeywordMatchCommand {
  matchers: Array<string>;
  fn: (message: Message<true>) => Promise<void>;
}

type KeywordMatchCommands = Array<KeywordMatchCommand>;

interface KeywordMatchResult {
  keyword: string;
  promise: Promise<void>;
}

const processKeywordMatch = (message: Message<true>, config: KeywordMatchCommands): Array<KeywordMatchResult | undefined> => {
  return config.map((conf) => {
    const matchedKeyword = conf.matchers.find((keyword) => keywordMatched(message.content, keyword));

    if (!matchedKeyword) {
      return undefined;
    }

    return { keyword: matchedKeyword, promise: conf.fn(message) };
  });
};

export interface CommandConfig {
  keywordMatchCommands: KeywordMatchCommands;
}

const handleMessage = async (message: Message<true>, config: CommandConfig, span: Span) => {
  span.setAttribute('discord.channel.id', message.channelId);
  span.setAttribute('discord.message.id', message.id);
  span.setAttribute('discord.guild.id', message.guildId);
  span.setAttribute('enduser.id', message.author.id);

  const honeypotChannelId = getHoneypotChannelId(message.guildId);
  if (honeypotChannelId && message.channelId === honeypotChannelId) {
    span.setAttribute('bot.message.processed', true);
    span.setAttribute('bot.message.honeypot', true);
    const result = await Result.safe(handleHoneypotTrigger(message));
    if (result.isErr()) {
      recordSpanError(result.unwrapErr(), 'err-honeypot-trigger-failed');
      logger.error('[honeypot]: Error processing honeypot trigger', result.unwrapErr());
    }
    return;
  }

  const keywordResults = processKeywordMatch(message, config.keywordMatchCommands);
  const matches = keywordResults.filter((r): r is KeywordMatchResult => r !== undefined);
  span.setAttribute('bot.message.processed', matches.length > 0);
  if (matches.length > 0) {
    span.setAttribute('bot.message.matched_keywords', matches.map((m) => m.keyword).join(','));
  }

  const keywordResult = await Result.safe(Promise.all(matches.map((m) => m.promise)));
  if (keywordResult.isErr()) {
    recordSpanError(keywordResult.unwrapErr(), 'err-keyword-processing-failed');
    logger.error('ERROR PROCESSING MESSAGE', keywordResult.unwrapErr());
  }
};

export const processMessage = async (message: Message<true>, config: CommandConfig): Promise<void> => {
  return tracer.startActiveSpan('processMessage', async (span) => {
    await Result.safe(handleMessage(message, config, span));
    span.end();
  });
};
