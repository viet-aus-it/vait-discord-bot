import { Message, TextChannel } from 'discord.js';
import * as Cowsay from 'cowsay';
import { fetchMessageById } from '../../utils/messageFetcher';

const isBlank = (content: string) => content.trim() === '';

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
      ? content.slice(content.trimEnd().indexOf(' '))
      : '';

  // if there is no chat content
  if (isBlank(chatContent) && reference && reference.channelID !== null) {
    chatContent = await fetchMessageById(
      channel as TextChannel,
      reference.messageID as string
    );
  } else {
    return;
  }

  const reply = '```' + generateCowsayText(chatContent) + '```';
  channel.send(reply);
};

export default cowsay;
