import { Message } from 'discord.js';

type CommandPromise = Promise<any> | undefined;

type CommandPromises = Array<CommandPromise>;

interface KeywordMatchCommand {
  matchers: Array<string>;
  fn: (message: Message) => Promise<any>;
}

type KeywordMatchCommands = Array<KeywordMatchCommand>;

const processKeywordMatch = (
  message: Message,
  config: KeywordMatchCommands
): CommandPromises => {
  return config.map((conf) => {
    const hasKeyword = conf.matchers.some((keyword) =>
      message.content.toLowerCase().includes(keyword)
    );

    if (!hasKeyword) {
      return;
    }

    return conf.fn(message);
  });
};

interface PrefixedCommand {
  matcher: string;
  fn: (message: Message) => Promise<any>;
}

interface PrefixedCommands {
  prefix: string;
  commands: Array<PrefixedCommand>;
}

const processPrefixedMatch = (
  message: Message,
  config: PrefixedCommands
): CommandPromises => {
  return config.commands.map((conf) => {
    const prefixCommand = `${config.prefix}${conf.matcher}`;
    const hasMatchingPrefix = message.content.startsWith(prefixCommand);

    if (!hasMatchingPrefix) return;

    return conf.fn(message);
  });
};

interface EmojiMatchCommand {
  matcher: string;
  fn: (message: Message) => Promise<any>;
}

const processEmojiMatch = (
  message: Message,
  config: EmojiMatchCommand
): CommandPromise => {
  const hasEmoji = message.content.match(config.matcher);
  if (!hasEmoji) return;

  return config.fn(message);
};

interface LinkMatchCommand {
  fn: (message: Message) => Promise<any>;
}

const processLinkMatch = (
  message: Message,
  config: LinkMatchCommand
): CommandPromise => {
  const hasDiscordLink = message.content.match(
    /https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+/gim
  );
  if (!hasDiscordLink) return;

  return config.fn(message);
};

const removeUndefinedPromises = (promises: CommandPromises) =>
  promises.filter((p) => p !== undefined);

export interface CommandConfig {
  prefixedCommands: PrefixedCommands;
  keywordMatchCommands: KeywordMatchCommands;
  emojiMatchCommand: EmojiMatchCommand;
  linkMatchCommand: LinkMatchCommand;
}

export const processMessage = async (
  message: Message,
  config: CommandConfig
) => {
  const prefixPromises = processPrefixedMatch(message, config.prefixedCommands);

  // If message already has a prefix command, don't process these.
  const hasPrefixPromises = removeUndefinedPromises(prefixPromises).length > 0;
  const keywordPromises = hasPrefixPromises
    ? []
    : processKeywordMatch(message, config.keywordMatchCommands);
  const emojiPromises = hasPrefixPromises
    ? undefined
    : processEmojiMatch(message, config.emojiMatchCommand);
  const linkPromises = hasPrefixPromises
    ? undefined
    : processLinkMatch(message, config.linkMatchCommand);

  const promises = removeUndefinedPromises([
    ...prefixPromises,
    ...keywordPromises,
    emojiPromises,
    linkPromises,
  ]);

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('ERROR PROCESSING MESSAGE', error);
  }
};

export * from './parseConfigFile';
