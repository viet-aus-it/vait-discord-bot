import { Message } from 'discord.js';
import { getOrCreateUser, updateRep } from './_helpers';

export const giveReputation = async (msg: Message) => {
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

  const user = await getOrCreateUser(discordUser.id);
  const updatedUser = await updateRep({
    fromUserId: discordUser.id,
    toUserId: user.id,
    adjustment: { reputation: { increment: 1 } },
  });

  channel.send(
    `${author.username} gave ${discordUser.username} 1 rep. \n${discordUser.username}'s current rep: ${updatedUser.reputation}`
  );
};
