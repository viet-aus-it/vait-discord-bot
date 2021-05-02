import { Message } from 'discord.js';
import { PrismaClient } from '.prisma/client';
import { getOrCreateUser } from './_helpers';

export const thankUser = async (
  msg: Message,
  botId: string,
  prisma: PrismaClient
) => {
  const thankKeywords = ['thank', 'thanks', 'cảm ơn'];
  const hasKeyword = thankKeywords.some((keyword) =>
    msg.content.toLowerCase().includes(keyword)
  );
  if (!hasKeyword) return;

  const hasExactlyOneUser = msg.mentions.users.size === 1;
  if (!hasExactlyOneUser) return;

  const discordUser = msg.mentions.users.first();
  if (!discordUser) return;

  const isAuthor = discordUser.id === msg.author.id;
  if (isAuthor) return;

  const isBot = discordUser.id === botId;
  if (isBot) return;

  const user = await getOrCreateUser(prisma, discordUser.id);

  const updatedUserPromise = prisma.user.update({
    where: { id: user.id },
    data: { reputation: { increment: 1 } },
  });
  const logPromise = prisma.reputationLog.create({
    data: {
      fromUserId: discordUser.id,
      toUserId: user.id,
    },
  });
  const [updatedUser] = await prisma.$transaction([
    updatedUserPromise,
    logPromise,
  ]);

  msg.reply(`${discordUser.username}: ${updatedUser.reputation} Rep`);
};
