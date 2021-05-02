import { Message } from 'discord.js';
import { getRandomIntInclusive } from '../utils/random';

export const danhSomeone = (msg: Message, botId: string) => {
  const keyword = '-hit';
  const hasKeyword = msg.content.startsWith(keyword);
  if (!hasKeyword) return;
  if (msg.author.id === botId) return; // return if message is from a Discord bot
  if (!msg.mentions) return;
  if (!msg.mentions.users?.first()) return; // return if no user is mentioned

  msg.mentions.users.forEach((user) => {
    if (user.id === botId) {
      msg.channel.send(
        `${msg.author.username},I'm your father, you can't hit me`
      );
    } else if (msg.author.id === user.id) {
      msg.reply(`Stop hitting yourself ${user.username}, hit someone else`);
    } else {
      msg.channel.send(
        `${user.username} takes ${getRandomIntInclusive(0, 100)} dmg`
      );
    }
  });
};
export default danhSomeone;
