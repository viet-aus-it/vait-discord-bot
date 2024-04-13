import { getDbClient } from '../../clients';

export const addAutobumpThread = async (guildId: string, threadId: string) => {
  const db = getDbClient();
  const settings = await db.serverChannelsSettings.upsert({
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
  const db = getDbClient();
  const { autobumpThreads } = await db.serverChannelsSettings.findFirstOrThrow({
    where: { guildId },
  });

  const settings = await db.serverChannelsSettings.update({
    where: { guildId },
    data: {
      autobumpThreads: autobumpThreads.filter((t) => t !== threadId),
    },
  });

  return settings.autobumpThreads;
};

export const listThreadsByGuild = async (guildId: string) => {
  const db = getDbClient();
  const settings = await db.serverChannelsSettings.findFirstOrThrow({
    where: { guildId },
  });

  return settings.autobumpThreads;
};

export const listAllThreads = async () => {
  const db = getDbClient();
  const settings = await db.serverChannelsSettings.findMany({
    select: {
      guildId: true,
      autobumpThreads: true,
    },
  });

  return settings;
};
