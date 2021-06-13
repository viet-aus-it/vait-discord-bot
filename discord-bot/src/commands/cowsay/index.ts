import { Message, TextChannel } from 'discord.js';
import { say } from 'cowsay';
import {
  fetchLastMessageBeforeId,
  fetchMessageById,
} from '../../utils/messageFetcher';

// Only 35 characters per line due to limitation in phone screen width
const WRAP_TEXT_LIMIT = 35;

const isBlank = (content: string) => content.trim() === '';

const replaceAll = (string: string, from: string, to: string) =>
  string.split(from).join(to);

// Remove backtick in message in case of nesting cowsay
export const removeBacktick = (message: string) => {
  if (message.indexOf('`') !== -1) {
    return replaceAll(message, '`', '');
  }
  return message;
};

// Wrap text in multiple lines in case of long text input
const wrapText = (input: string, width: number) => {
  const resultArray = [];
  const words = input.split(' ');
  let line = '';

  // Check each words
  words.forEach((word) => {
    if ((line + word).length <= width) {
      // Add a word if line lenght is within limit
      line += (line ? ' ' : '') + word;
    } else {
      // Register and skip to next line if too long
      resultArray.push(line);
      line = word;
    }
  });

  // Add any leftover line to next line.
  resultArray.push(line);

  return resultArray.join('\n');
};

const generateCowsayText = (message: string) => {
  let chatContent = removeBacktick(message);
  chatContent = wrapText(chatContent, WRAP_TEXT_LIMIT);

  const config = { text: chatContent };
  return say(config);
};

// Send Cowsay text
const sendCowsay = async (chatContent: string, channel: TextChannel) => {
  const reply = `\`\`\`${generateCowsayText(chatContent)}\`\`\``;

  try {
    await channel.send(reply);
  } catch (error) {
    console.error('CANNOT SEND MESSAGE', error);
  }
};

const cowsay = async ({ content, reference, channel, id, author }: Message) => {
  // Return if sender is bot
  if (author.bot) return;

  const textChannel = channel as TextChannel;

  const firstSpaceChar = content.trimEnd().indexOf(' ');

  let chatContent = removeBacktick(
    firstSpaceChar !== -1 ? content.slice(firstSpaceChar).trimStart() : ''
  );

  // If cowsay is called with chat content
  if (!isBlank(chatContent)) {
    sendCowsay(chatContent, textChannel);
    return;
  }

  // If there is no chat content...
  if (reference && reference.channelID !== null) {
    // And there is a reference to another message, fetch that message
    chatContent = await fetchMessageById(
      textChannel,
      reference.messageID as string
    );
  } else {
    // Or just fetch the latest message
    chatContent = await fetchLastMessageBeforeId(textChannel, id);
  }

  // if the content stil blank at this point, exit
  if (isBlank(chatContent)) {
    return;
  }

  sendCowsay(chatContent, textChannel);
};

export default cowsay;
