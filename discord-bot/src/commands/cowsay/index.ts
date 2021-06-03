import { Message, TextChannel } from 'discord.js';
import * as Cowsay from 'cowsay';
import {
  fetchLastMessageBeforeId,
  fetchMessageById,
} from '../../utils/messageFetcher';

const isBlank = (content: string) => content.trim() === '';

const replaceAll = (string: string, from: string, to: string) =>
  string.split(from).join(to);

// Remove backtick in message in case of nesting cowsay
const removeBacktick = (message: string) => {
  if (message.indexOf('`') !== -1) {
    return replaceAll(message, '`', '');
  }
  return message;
};

const generateCowsayText = (message: string) => {
  const config = {
    text: message,
  };
  return Cowsay.say(config);
};

const cowsay = async ({ content, reference, channel, id, author }: Message) => {
  // Return if sender is bot
  if (author.bot) return;

  let chatContent = removeBacktick(
    content.trimEnd().indexOf(' ') !== -1
      ? content.slice(content.trimEnd().indexOf(' ')).trimStart()
      : ''
  );

  // If there is no chat content...
  if (isBlank(chatContent)) {
    if (reference && reference.channelID !== null) {
      // And there is a reference to another message, fetch that message
      chatContent = await fetchMessageById(
        channel as TextChannel,
        reference.messageID as string
      );
    } else {
      // Or just fetch the latest message
      chatContent = await fetchLastMessageBeforeId(channel as TextChannel, id);
    }
  }

  chatContent = removeBacktick(chatContent);
  const reply = `\`\`\`${generateCowsayText(chatContent)}\`\`\``;

  try {
    await channel.send(reply);
  } catch (error) {
    console.error('CANNOT SEND MESSAGE', error);
  }
};

export default cowsay;
