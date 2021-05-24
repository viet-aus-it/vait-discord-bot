import { Message } from 'discord.js';

export interface PrefixedCommand {
  matcher: string;
  fn: (message: Message) => Promise<any>;
}

export interface PrefixedCommands {
  prefix: string;
  commands: Array<PrefixedCommand>;
}

export interface KeywordMatchCommand {
  matchers: Array<string>;
  fn: (message: Message) => Promise<any>;
}
export interface EmojiMatchCommand {
  matcher: string;
  fn: (message: Message) => Promise<any>;
}

export interface LinkMatchCommand {
  fn: (message: Message) => Promise<any>;
}
export interface CommandConfig {
  prefixedCommands: PrefixedCommands;
  keywordMatchCommands: Array<KeywordMatchCommand>;
  emojiMatchCommand: EmojiMatchCommand;
  linkMatchCommand: LinkMatchCommand;
}

export const processMessage = async (
  message: Message,
  config: CommandConfig
) => {
  const keywordPromises = processKeywordMatch(
    message,
    config.keywordMatchCommands
  );
  const prefixPromises = processPrefixedMatch(message, config.prefixedCommands);
  const emojiPromises =
    prefixPromises.filter((p) => p !== undefined).length > 0
      ? undefined
      : processEmojiMatch(message, config.emojiMatchCommand); // if match any prefix commands, don't process emoji
  const linkPromises =
    prefixPromises.filter((p) => p !== undefined).length > 0
      ? undefined
      : processLinkMatch(message, config.linkMatchCommand); // if match any prefix commands, don't process link
  const promises = [
    ...keywordPromises,
    ...prefixPromises,
    emojiPromises,
    linkPromises,
  ].filter((p) => p !== undefined);
  await Promise.all(promises).catch(console.error);
};

const processEmojiMatch = (
  message: Message,
  config: EmojiMatchCommand
): Promise<any> | undefined => {
  const hasEmoji = message.content.match(config.matcher);
  if (!hasEmoji) {
    return;
  }
  return config.fn(message);
};

const processLinkMatch = (
  message: Message,
  config: LinkMatchCommand
): Promise<any> | undefined => {
  const hasDiscordLink = message.content.match(
    /https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+/gim
  );
  if (!hasDiscordLink) {
    return;
  }
  return config.fn(message);
};

const processKeywordMatch = (
  message: Message,
  config: Array<KeywordMatchCommand>
): Array<Promise<any> | undefined> => {
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

const processPrefixedMatch = (
  message: Message,
  config: PrefixedCommands
): Array<Promise<any> | undefined> => {
  return config.commands.map((conf) => {
    const prefixCommand = `${config.prefix}${conf.matcher}`;
    const hasMatchingPrefix = message.content.startsWith(prefixCommand);

    if (!hasMatchingPrefix) {
      return;
    }

    return conf.fn(message);
  });
};
