import { Message, TextChannel } from 'discord.js';
import * as Cowsay from 'cowsay';
import { fetchMessageById } from '../../utils/messageFetcher';

const isBlank = (content: string) => content.trim() === '';

// Remove backtick in message in case of nesting cowsay
const removeBacktick = (message: string) => {
  if (message.indexOf('```') !== -1) {
    return message.slice(3, -3);
  }
  return message;
};

const generateCowsayText = (message: string) => {
  const config = {
    text: message,
  };
  return Cowsay.say(config);
};

const cowsay = async ({ content, reference, channel, author }: Message) => {
  // Return if sender is bot
  if (author.bot) return;

  let chatContent =
    content.trimEnd().indexOf(' ') !== -1
      ? content.slice(content.trimEnd().indexOf(' ')).trimStart()
      : '';

  // If there is no chat content, then assign any reference as chat content
  if (isBlank(chatContent)) {
    if (reference && reference.channelID !== null) {
      chatContent = await fetchMessageById(
        channel as TextChannel,
        reference.messageID as string
      );
    } else {
      return;
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
