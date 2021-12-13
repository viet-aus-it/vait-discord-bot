import { Message } from 'discord.js';
import { isMessageSentFromAdmin } from '../../utils/isMessageSentFromAdmin';
import { getOrCreateUser, updateRep } from './_helpers';

export const takeReputation = async (msg: Message) => {
  const { author, channel, mentions } = msg;
  if (author.bot) return; // return if author is a Discord bot

  const isAdmin = isMessageSentFromAdmin(msg);
  if (!isAdmin) {
    return channel.send(
      "You don't have enough permission to run this command."
    );
  }

  const hasExactlyOneUser = mentions.users.size === 1;
  if (!hasExactlyOneUser) return;

  const discordUser = mentions.users.first();
  if (!discordUser) return;
  if (discordUser.bot) return; // return if mention bot

  const user = await getOrCreateUser(discordUser.id);
  if (user.reputation === 0) {
    return channel.send(`${discordUser.username} currently has 0 rep`);
  }

  const updatedUser = await updateRep({
    fromUserId: discordUser.id,
    toUserId: user.id,
    adjustment: { reputation: { decrement: 1 } },
  });

  channel.send(
    `${author.username} took from ${discordUser.username} 1 rep. \n${discordUser.username}'s current rep: ${updatedUser.reputation}`
  );
};
