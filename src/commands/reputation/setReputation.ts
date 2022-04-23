import { GuildMember, Message } from 'discord.js';
import { isAdmin, isModerator } from '../../utils';
import { getOrCreateUser, updateRep } from './_helpers';

export const setReputation = async (msg: Message) => {
  const { author, channel, mentions } = msg;
  if (author.bot) return; // return if author is a Discord bot

  const guildMember = msg.member as GuildMember;
  if (!isAdmin(guildMember) && !isModerator(guildMember)) {
    return channel.send(
      "You don't have enough permission to run this command."
    );
  }

  const hasExactlyOneUser = mentions.users.size === 1;
  if (!hasExactlyOneUser) return;

  const discordUser = mentions.users.first();
  if (!discordUser) return; // return if user not found
  if (discordUser.bot) return; // return if mention bot

  const splittedMessage = msg.content.split(/\s+/);
  if (splittedMessage.length !== 3) {
    return channel.send(
      'Wrong format. The correct format is `setRep @username repNumber`'
    );
  }

  const repNumber = Number(splittedMessage[2]);
  if (Number.isNaN(repNumber) || repNumber < 0) {
    return channel.send("Invalid, cannot set the user's rep to this value");
  }

  const user = await getOrCreateUser(discordUser.id);
  const updatedUser = await updateRep({
    fromUserId: discordUser.id,
    toUserId: user.id,
    adjustment: { reputation: { set: repNumber } },
  });

  channel.send(
    `${author.username} just set ${discordUser.username}'s rep to ${repNumber}. \n${discordUser.username}'s current rep: ${updatedUser.reputation}`
  );
};
