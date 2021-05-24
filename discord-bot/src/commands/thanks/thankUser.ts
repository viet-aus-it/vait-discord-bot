import { Message } from 'discord.js';
import { getOrCreateUser } from './_helpers';
import { getPrismaClient } from '../../clients/prisma';

export const thankUser = async (msg: Message) => {
  const prisma = getPrismaClient();
  const { author, channel, mentions } = msg;
  if (author.bot) return; // return if author is a Discord bot
  const hasExactlyOneUser = mentions.users.size === 1;
  if (!hasExactlyOneUser) return;

  const discordUser = mentions.users.first();
  if (!discordUser) return;
  if (discordUser.bot) return; // return if mention bot

  const isAuthor = discordUser.id === author.id;

  if (isAuthor) {
    msg.reply('You cannot give rep to yourself');
    return;
  }

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

  channel.send(
    `${author.username} gave ${discordUser.username} 1 rep. \n${discordUser.username}'s current rep: ${updatedUser.reputation}`
  );
};
