import { getDbClient } from '../../clients';
import { tracer } from '../../utils/tracer';

export const addAutobumpThread = async (guildId: string, threadId: string) => {
  return tracer.startActiveSpan('db.autobumpThreads.addAutobumpThread', async (span) => {
    try {
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
    } finally {
      span.end();
    }
  });
};

export const removeAutobumpThread = async (guildId: string, threadId: string) => {
  return tracer.startActiveSpan('db.autobumpThreads.removeAutobumpThread', async (span) => {
    try {
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
    } finally {
      span.end();
    }
  });
};

export const listThreadsByGuild = async (guildId: string) => {
  return tracer.startActiveSpan('db.autobumpThreads.listThreadsByGuild', async (span) => {
    try {
      const db = getDbClient();
      const settings = await db.serverChannelsSettings.findFirstOrThrow({
        where: { guildId },
      });

      return settings.autobumpThreads;
    } finally {
      span.end();
    }
  });
};

export const listAllThreads = async () => {
  return tracer.startActiveSpan('db.autobumpThreads.listAllThreads', async (span) => {
    try {
      const db = getDbClient();
      const settings = await db.serverChannelsSettings.findMany({
        select: {
          guildId: true,
          autobumpThreads: true,
        },
      });

      return settings;
    } finally {
      span.end();
    }
  });
};
