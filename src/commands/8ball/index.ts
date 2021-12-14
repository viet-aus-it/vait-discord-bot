import { Message } from 'discord.js';

const ask8Ball = async ({ content, channel, author }: Message) => {
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
    'Keep it up',
  ] as const;

  if (author.bot) return; // return if sender is a bot
  if (content.split(' ').length <= 1) return; // return if no question ask
  await channel.send(replies[Math.floor(Math.random() * replies.length)]);
};
export default ask8Ball;
