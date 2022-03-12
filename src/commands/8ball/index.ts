import { Message } from 'discord.js';
import { getRandomIntInclusive } from '../../utils';

const REPLIES = [
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
const get8BallReply = () => REPLIES[getRandomIntInclusive(0, REPLIES.length)];

export const ask8Ball = async (msg: Message) => {
  const { content, channel, author } = msg;

  if (author.bot) return; // return if sender is a bot
  if (content.split(' ').length <= 1) {
    await msg.reply(
      'SYNTAX ERROR: Please provide a question after the `8ball` keyword'
    );
    return;
  }
  await channel.send(get8BallReply());
};
