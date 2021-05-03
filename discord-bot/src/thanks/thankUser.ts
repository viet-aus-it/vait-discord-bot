import { Message } from 'discord.js';
import { getOrCreateUser } from './_helpers';
import { getPrismaClient } from '../clients/prisma';

export const thankUser = async (msg: Message) => {
  const prisma = getPrismaClient();

  const thankKeywords = ['thank', 'thanks', 'cảm ơn', 'cám ơn'];
  const hasKeyword = thankKeywords.some((keyword) =>
    msg.content.toLowerCase().includes(keyword)
  );
  if (!hasKeyword) return;
  if (msg.author.bot) return; // return if author is a Discord bot
  const hasExactlyOneUser = msg.mentions.users.size === 1;
  if (!hasExactlyOneUser) return;

  const discordUser = msg.mentions.users.first();
  if (!discordUser) return;
  if (discordUser.bot) return; // return if mention bot

  const isAuthor = discordUser.id === msg.author.id;
  if (isAuthor) return;

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
