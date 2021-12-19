import { Message } from 'discord.js';
import { getRandomIntInclusive } from '../../utils';

export const danhSomeone = async (msg: Message, botId: string) => {
  if (msg.author.id === botId) return; // return if message is from this bot
  if (!msg.mentions) return;
  if (!msg.mentions.users?.first()) return; // return if no user is mentioned

  const promises = msg.mentions.users.map((user) => {
    if (user.id === botId) {
      return msg.channel.send(
        `${msg.author.username}, I'm your father, you can't hit me`
      );
    }

    if (msg.author.id === user.id) {
      return msg.reply(
        `Stop hitting yourself ${user.username}, hit someone else`
      );
    }

    return msg.channel.send(
      `${user.username} takes ${getRandomIntInclusive(0, 100)} dmg`
    );
  });

  await Promise.all(promises);
};
