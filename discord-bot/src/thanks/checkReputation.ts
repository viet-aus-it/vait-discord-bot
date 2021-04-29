import { Message } from 'discord.js';
import { PrismaClient } from '.prisma/client';
import { getOrCreateUser } from './_helpers';

export const checkReputation = async (msg: Message, prisma: PrismaClient) => {
  const keyword = '-rep';
  const hasKeyword = msg.content === keyword;
  if (!hasKeyword) return;

  const discordUser = msg.author;
  const user = await getOrCreateUser(prisma, discordUser.id);
  msg.reply(`${discordUser.username}: ${user.reputation} Rep`);
};
