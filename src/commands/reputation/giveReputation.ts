import { Message } from 'discord.js';
import { getOrCreateUser, updateRep } from './_helpers';

export const giveReputation = async (msg: Message) => {
  const { author, channel, mentions } = msg;
  if (author.bot) return; // return if author is a Discord bot

  // Filter out bot users
  const mentionedUsers = mentions.users.filter((user) => !user.bot);
  if (mentionedUsers.size < 1) return;

  const promises = mentionedUsers.map(async (discordUser) => {
    const isAuthor = discordUser.id === author.id;
    if (isAuthor) {
      return msg.reply('You cannot give rep to yourself');
    }

    const user = await getOrCreateUser(discordUser.id);
    const updatedUser = await updateRep({
      fromUserId: author.id,
      toUserId: user.id,
      adjustment: { reputation: { increment: 1 } },
    });

    return channel.send(
      `${author.username} gave ${discordUser.username} 1 rep. \n${discordUser.username}'s current rep: ${updatedUser.reputation}`
    );
  });

  return Promise.allSettled(promises);
};
