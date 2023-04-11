import { ServerChannelsSettings } from '@prisma/client';
import { getPrismaClient } from '../../clients';
import { OpResult } from '../../utils/opResult';

export const setReminderChannel = async (
  guildId: string,
  channelId: string
): OpResult<string> => {
  const prisma = getPrismaClient();
  try {
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

    return {
      success: true,
      data: settings.reminderChannel as string,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error,
    };
  }
};

export const getReminderChannel = async (
  guildId: string
): OpResult<ServerChannelsSettings['reminderChannel']> => {
  const prisma = getPrismaClient();
  try {
    const serverSettings = await prisma.serverChannelsSettings.findFirstOrThrow(
      {
        where: { guildId },
      }
    );
    return {
      success: true,
      data: serverSettings.reminderChannel,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error,
    };
  }
};
