import { Message } from 'discord.js';

const pingPong = (msg: Message) => {
  if (msg.content === 'ping') msg.reply('pong');
};
export default pingPong;
