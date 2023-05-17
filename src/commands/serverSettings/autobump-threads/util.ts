import { ServerChannelsSettings } from '@prisma/client';
import { getPrismaClient } from '../../../clients';
import { OpResult } from '../../../utils/opResult';

export const addAutobumpThread = async (
  guildId: string,
  threadId: string
): OpResult<ServerChannelsSettings['autobumpThreads']> => {
  const prisma = getPrismaClient();
  try {
    const settings = await prisma.serverChannelsSettings.upsert({
      where: { guildId },
      update: {
        autobumpThreads: {
          push: threadId,
        },
      },
      create: {
        guildId,
        autobumpThreads: [threadId],
      },
    });

    return {
      success: true,
      data: settings.autobumpThreads,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error,
    };
  }
};

export const removeAutobumpThread = async (
  guildId: string,
  threadId: string
): OpResult<ServerChannelsSettings['autobumpThreads']> => {
  const prisma = getPrismaClient();
  try {
    const { autobumpThreads } =
      await prisma.serverChannelsSettings.findFirstOrThrow({
        where: { guildId },
      });

    const settings = await prisma.serverChannelsSettings.update({
      where: { guildId },
      data: {
        autobumpThreads: autobumpThreads.filter((t) => t !== threadId),
      },
    });

    return {
      success: true,
      data: settings.autobumpThreads,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error,
    };
  }
};

export const listThreadsByGuild = async (
  guildId: string
): OpResult<ServerChannelsSettings['autobumpThreads']> => {
  const prisma = getPrismaClient();
  try {
    const settings = await prisma.serverChannelsSettings.findFirstOrThrow({
      where: { guildId },
    });
    return {
      success: true,
      data: settings.autobumpThreads,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error,
    };
  }
};
