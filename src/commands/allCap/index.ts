import { Message, TextChannel } from 'discord.js';
import {
  fetchLastMessageBeforeId,
  fetchMessageById,
  isBlank,
} from '../../utils';

type GetChatContentPayload = Pick<
  Message,
  'content' | 'reference' | 'id' | 'channel'
>;

const generateAllCapText = (message: string) =>
  message
    .trim()
    .toUpperCase()
    .split('')
    .reduce((outputText, character) => {
      return `${outputText + character} `;
    }, '');

const getChatContent = async ({
  content,
  channel,
  reference,
  id,
}: GetChatContentPayload) => {
  const cmdSpaceIndex = content.trimEnd().indexOf(' ');
  const textChannel = channel as TextChannel;

  if (cmdSpaceIndex !== -1) {
    return content.slice(cmdSpaceIndex);
  }

  if (reference?.messageId) {
    const chatContent = await fetchMessageById(
      textChannel,
      reference.messageId
    );
    return chatContent;
  }

  const chatContent = await fetchLastMessageBeforeId(textChannel, id);
  return chatContent;
};

export const allCapExpandText = async ({
  content,
  channel,
  id,
  reference,
  author,
}: Message) => {
  if (author.bot) return; // return if sender is bot

  const chatContent = await getChatContent({ content, channel, reference, id });

  // If it's still blank at this point, then exit
  if (isBlank(chatContent)) {
    return;
  }

  const allCapText = generateAllCapText(chatContent);
  channel.send(allCapText);
};
