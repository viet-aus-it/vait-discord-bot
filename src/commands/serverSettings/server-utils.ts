import { getPrismaClient } from '../../clients';

export const setReminderChannel = async (
  guildId: string,
  channelId: string
) => {
  const prisma = getPrismaClient();
  const settings = await prisma.serverChannelsSettings.upsert({
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
  const prisma = getPrismaClient();
  const serverSettings = await prisma.serverChannelsSettings.findFirstOrThrow({
    where: { guildId },
  });

  return serverSettings.reminderChannel;
};
