import { Message } from 'discord.js';
import { PrismaClient } from '.prisma/client';
import { thankUser } from './thankUser';
import { checkReputation } from './checkReputation';

const thanks = async (msg: Message, botId: string, prisma: PrismaClient) => {
  await checkReputation(msg, prisma);
  await thankUser(msg, botId, prisma);
};

export default thanks;
