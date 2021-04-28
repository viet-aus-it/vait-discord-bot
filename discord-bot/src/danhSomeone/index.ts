import { Message } from 'discord.js';

const getRandomIntInclusive = (min: number, max: number) => {
  const intMin = Math.ceil(min);
  const intMax = Math.floor(max);
  return Math.floor(Math.random() * (intMax - intMin + 1) + min);
};

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
