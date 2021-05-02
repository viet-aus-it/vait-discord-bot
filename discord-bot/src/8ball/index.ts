import { Message } from 'discord.js';

const ask8Ball = ({ content, channel, author }: Message) => {
  const prefix = '-8ball';
  const replies = [
    'Yes',
    'No',
    'Hell Yes',
    'Hell No',
    'Ye Nah',
    'Nah Ye',
    'Fk No',
    'Fk Ye',
    'Go for it',
    "Don't even think about it",
    'Are you even trying?',
    'Keep it up'
  ];
  const hasPrefix = content.toLowerCase().startsWith(prefix);
  if (!hasPrefix) return; // return if no prefix
  if (author.bot) return; // return if sender is a bot
  if (content.slice(prefix.length).trim().length === 0) return; // return if no question ask
  channel.send(replies[Math.floor(Math.random() * replies.length)]);
};
export default ask8Ball;
