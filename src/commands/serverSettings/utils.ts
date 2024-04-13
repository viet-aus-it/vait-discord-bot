import { getDbClient } from '../../clients';

export const setReminderChannel = async (guildId: string, channelId: string) => {
  const db = getDbClient();
  const settings = await db.serverChannelsSettings.upsert({
    where: {
      guildId,
    },
    update: {
      reminderChannel: channelId,
    },
    create: {
      guildId,
      reminderChannel: channelId,
    },
  });

  return settings.reminderChannel as string;
};

export const getReminderChannel = async (guildId: string) => {
  const db = getDbClient();
  const serverSettings = await db.serverChannelsSettings.findFirstOrThrow({
    where: { guildId },
  });

  return serverSettings.reminderChannel;
};
