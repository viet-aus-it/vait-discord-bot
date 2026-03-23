import { getDbClient } from './clients';
import { thankUserInMessage } from './slash-commands/reputation/give-reputation';
import type { CommandConfig } from './utils/message-processor';

const honeypotChannels = new Map<string, string>();

export const getHoneypotChannelId = (guildId: string): string | undefined => {
  return honeypotChannels.get(guildId);
};

export const setHoneypotChannelId = (guildId: string, channelId: string): void => {
  honeypotChannels.set(guildId, channelId);
};

export const getConfigs = async (): Promise<CommandConfig> => {
  const db = getDbClient();
  const settings = await db.serverChannelsSettings.findMany({
    where: { honeypotChannel: { not: null } },
    select: { guildId: true, honeypotChannel: true },
  });

  for (const setting of settings) {
    if (setting.honeypotChannel) {
      honeypotChannels.set(setting.guildId, setting.honeypotChannel);
    }
  }

  return {
    keywordMatchCommands: [
      {
        matchers: [
          'thank',
          'thanks',
          'cảm ơn',
          'cám ơn',
          'happy birthday',
          'hpbd',
          'chúc mừng sinh nhật',
          'xia xia',
          'arigato',
          'komawo',
          'kamsahamnida',
          'gracias',
          'merci',
          'congratulations',
          'congrats',
          'congratz',
        ],
        fn: thankUserInMessage,
      },
    ],
  };
};
