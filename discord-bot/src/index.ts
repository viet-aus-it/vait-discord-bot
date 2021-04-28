import { Client } from 'discord.js';

const { TOKEN } = process.env;

const getRandomIntInclusive = (min: number, max: number) => {
  const ceilMin = Math.ceil(min);
  const ceilMax = Math.floor(max);
  return Math.floor(Math.random() * (ceilMax - ceilMin + 1) + min);
};

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('message', (msg) => {
  if (msg.content === 'ping') msg.reply('pong');

  if (msg.content.includes('thanks')) {
    msg.mentions.users.forEach((id) => {
      console.log(id);
    });
  }

  if (msg.content.toLowerCase().includes('danh')) {
    msg.mentions.users.forEach((user) => {
      if (user.id !== '778031290032324649')
        msg.reply(
          `${user.username} takes ${getRandomIntInclusive(0, 100)} dmg`
        );
    });
  }
});

client.login(TOKEN);
