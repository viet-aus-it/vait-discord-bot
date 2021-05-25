import { Message, TextChannel, MessageEmbed } from 'discord.js';
import { fetchWebhook, createWebhook } from '../../utils/webhookProcessor';

const createPoll = async (msg: Message) => {
  const { author, channel, content } = msg;
  if (author.bot) return; // return if author is bot

  const numberAsString = [
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
  const reactionNumbers = [
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
  const firstSpaceIndex = content.trimEnd().indexOf(' ');
  const message = content.slice(firstSpaceIndex);
  const hasQuestion = message.match(/".+"/);

  if (!hasQuestion) {
    // return a message with correct syntax
    msg.reply(
      'Syntax to create a poll is:\n`-poll "Question" pollOption1 pollOption2...pollOption9`\nQuestion must be placed in "", poll options are space delimited'
    );
    return;
  }
  const question = hasQuestion[0];
  const pollOptions = message.replace(question, '').trim().split(' ');

  if (pollOptions.length < 2) {
    msg.reply('You need at least 2 poll options for a valid poll');
    return;
  }

  if (pollOptions.length > 9) {
    msg.reply('Maximum 9 options are allowed');
    return;
  }

  const currentTextChannel = channel as TextChannel;

  let webhook = await fetchWebhook(currentTextChannel);

  if (!webhook) {
    webhook = await createWebhook(currentTextChannel); // create webhook if not found
  }

  if (!webhook) return; // return if can't find or create webhook

  const embed = createEmbeddedMessage(question, numberAsString, pollOptions);

  try {
    const pollMsg = await webhook.send({
      embeds: [embed],
      username: author.username,
      avatarURL: author.avatarURL() ?? undefined,
    });
    await msg.delete();
    const promises = pollOptions.map((_valuer, index) =>
      pollMsg.react(reactionNumbers[index])
    );
    await Promise.all(promises);
  } catch (error) {
    console.error(error);
  }
};

const createEmbeddedMessage = (
  question: string,
  numberAsString: string[],
  pollOptions: string[]
) => {
  const message = pollOptions.reduce((accumulator, option, index) => {
    return `${accumulator}:${numberAsString[index]}: ${option}\n\n`;
  }, '');
  const embed = new MessageEmbed()
    .setColor('#0072a8')
    .setTitle(question.replace(/"/gim, ''))
    .setFooter('Poll created')
    .setTimestamp()
    .addFields({ name: message, value: `\u200B` });
  return embed;
};

export default createPoll;
