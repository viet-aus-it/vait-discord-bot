import { Message } from 'discord.js';
import { getOrCreateUser } from './_helpers';

export const checkReputation = async (msg: Message) => {
  const discordUser = msg.author;
  const user = await getOrCreateUser(discordUser.id);
  msg.reply(`${discordUser.username}: ${user.reputation} Rep`);
};
