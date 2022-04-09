import { Message, MessageEmbed } from 'discord.js';

const NUMBER_AS_STRING = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];

const REACTION_NUMBERS = [
  '\u0031\u20E3',
  '\u0032\u20E3',
  '\u0033\u20E3',
  '\u0034\u20E3',
  '\u0035\u20E3',
  '\u0036\u20E3',
  '\u0037\u20E3',
  '\u0038\u20E3',
  '\u0039\u20E3',
];

const createEmbeddedMessage = (
  question: string,
  numberAsString: string[],
  pollOptions: string[]
) => {
  const message = pollOptions.reduce((accumulator, option, index) => {
    return `${accumulator}:${numberAsString[index]}: ${option}\n\n`;
  }, '');

  return new MessageEmbed({
    color: '#0072a8',
    title: question.replace(/"/gim, ''),
    footer: { text: 'Poll created' },
    fields: [{ name: message, value: `\u200B` }],
    timestamp: Date.now(),
  });
};

export const replyWithErrorMessage = async (msg: Message, content: string) => {
  try {
    await msg.reply(content);
    return;
  } catch (error) {
    console.error(error);
  }
};

export const createPoll = async (msg: Message) => {
  const { author, channel, content } = msg;
  if (author.bot) return; // return if author is bot

  const firstSpaceIndex = content.trimEnd().indexOf(' ');
  const message = content.slice(firstSpaceIndex);
  const hasQuestion = message.match(/".+"/);
  if (!hasQuestion) {
    return replyWithErrorMessage(
      msg,
      'Syntax to create a poll is:\n`-poll "Question" pollOption1 pollOption2...pollOption9`\nQuestion must be placed in "", poll options are space delimited'
    );
  }

  const question = hasQuestion[0];
  const pollOptions = message.replace(question, '').trim().split(' ');

  if (pollOptions.length < 2 || pollOptions.length > 9) {
    return replyWithErrorMessage(
      msg,
      'You need at least 2 and at most 9 options for a valid poll'
    );
  }

  const embed = createEmbeddedMessage(question, NUMBER_AS_STRING, pollOptions);

  try {
    const pollMsg = await channel.send({
      embeds: [embed],
    });
    await msg.delete();
    const promises = pollOptions.map((_value, index) =>
      pollMsg.react(REACTION_NUMBERS[index])
    );
    await Promise.all(promises);
  } catch (error) {
    console.error(error);
  }
};
