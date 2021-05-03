import { Message } from 'discord.js';
import { getOrCreateUser } from './_helpers';
import { getPrismaClient } from '../clients/prisma';

export const checkReputation = async (msg: Message) => {
  const prisma = getPrismaClient();

  const keyword = '-rep';
  const hasKeyword = msg.content === keyword;
  if (!hasKeyword) return;

  const discordUser = msg.author;
  const user = await getOrCreateUser(prisma, discordUser.id);
  msg.reply(`${discordUser.username}: ${user.reputation} Rep`);
};
