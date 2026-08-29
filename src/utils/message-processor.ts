import type { Span } from '@opentelemetry/api';
import type { Message } from 'discord.js';
import { Result } from 'oxide.ts';

import { getHoneypotChannelId, handleHoneypotTrigger } from './honeypot-handler';
import { logger } from './logger';
import { recordSpanError, setSpanAttributes, tracer } from './tracer';

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
  span.setAttributes({
    'discord.channel.id': message.channelId,
    'discord.message.id': message.id,
    'discord.guild.id': message.guildId,
    'enduser.id': message.author.id,
  });

  if (message.author.bot) {
    span.setAttributes({
      'bot.message.processed': false,
      'bot.message.fromBot': true,
    });
    return;
  }

  const honeypotChannelId = getHoneypotChannelId(message.guildId);
  if (honeypotChannelId && message.channelId === honeypotChannelId) {
    span.setAttributes({
      'bot.message.processed': true,
      'bot.message.honeypot': true,
    });
    const result = await Result.safe(handleHoneypotTrigger(message));
    if (result.isErr()) {
      setSpanAttributes({ 'bot.processor.success': false, 'bot.processor.reason': 'honeypot-trigger-failed' });
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
    setSpanAttributes({ 'bot.processor.success': false, 'bot.processor.reason': 'keyword-processing-failed' });
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
