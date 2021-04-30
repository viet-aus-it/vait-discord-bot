import { Message } from 'discord.js';
import { getRandomIntInclusive } from '../utils/random';

const danhSomeone = (msg: Message) => {
  if (msg.content.toLowerCase().includes('danh')) {
    msg.mentions.users.forEach((user) => {
      console.log(user);

      if (user.id !== '778031290032324649')
        msg.reply(
          `${user.username} takes ${getRandomIntInclusive(0, 100)} dmg`
        );
    });
  }
};
export default danhSomeone;
