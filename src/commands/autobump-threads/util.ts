import { getPrismaClient } from '../../clients';

export const addAutobumpThread = async (guildId: string, threadId: string) => {
  const prisma = getPrismaClient();
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

  return settings.autobumpThreads;
};

export const removeAutobumpThread = async (guildId: string, threadId: string) => {
  const prisma = getPrismaClient();
  const { autobumpThreads } = await prisma.serverChannelsSettings.findFirstOrThrow({
    where: { guildId },
  });

  const settings = await prisma.serverChannelsSettings.update({
    where: { guildId },
    data: {
      autobumpThreads: autobumpThreads.filter((t) => t !== threadId),
    },
  });

  return settings.autobumpThreads;
};

export const listThreadsByGuild = async (guildId: string) => {
  const prisma = getPrismaClient();
  const settings = await prisma.serverChannelsSettings.findFirstOrThrow({
    where: { guildId },
  });

  return settings.autobumpThreads;
};

export const listAllThreads = async () => {
  const prisma = getPrismaClient();
  const settings = await prisma.serverChannelsSettings.findMany({
    select: {
      guildId: true,
      autobumpThreads: true,
    },
  });

  return settings;
};
