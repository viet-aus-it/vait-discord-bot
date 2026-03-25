import { context, SpanKind, trace } from '@opentelemetry/api';
import { SamplingDecision, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
import type { Message } from 'discord.js';
import { Result } from 'oxide.ts';
import { getHoneypotChannelId, handleHoneypotTrigger } from './honeypot-handler';
import { logger } from './logger';
import { tracer } from './tracer';

const unprocessedSampler = new TraceIdRatioBasedSampler(0.0001);

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

  if (!shouldProcess) {
    const traceId = trace.getSpan(context.active())?.spanContext()?.traceId ?? '';
    const samplingResult = unprocessedSampler.shouldSample(context.active(), traceId, 'processMessage.unprocessed', SpanKind.INTERNAL, {}, []);
    if (samplingResult.decision === SamplingDecision.NOT_RECORD) return;
  }

  return tracer.startActiveSpan('processMessage', async (span) => {
    try {
      span.setAttribute('discord.channel.id', message.channelId);
      span.setAttribute('discord.guild.id', message.guildId);
      span.setAttribute('discord.message.id', message.id);
      span.setAttribute('message.processed', shouldProcess);

      const honeypotChannelId = getHoneypotChannelId(message.guildId);
      if (honeypotChannelId && message.channelId === honeypotChannelId) {
        const result = await Result.safe(handleHoneypotTrigger(message));
        if (result.isErr()) {
          span.setAttribute('error', true);
          span.setAttribute('error.message', String(result.unwrapErr()));
          logger.error('[honeypot]: Error processing honeypot trigger', { error: result.unwrapErr() });
        }
        return;
      }

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
