import { Message } from 'discord.js';
import { getOrCreateUser } from './_helpers';
import { getPrismaClient } from '../clients/prisma';

export const checkReputation = async (msg: Message) => {
  const prisma = getPrismaClient();

  const discordUser = msg.author;
  const user = await getOrCreateUser(prisma, discordUser.id);
  msg.reply(`${discordUser.username}: ${user.reputation} Rep`);
};
