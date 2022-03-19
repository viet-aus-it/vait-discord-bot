import { Message, TextChannel } from 'discord.js';
import {
  fetchMessageById,
  fetchLastMessageBeforeId,
} from '../../utils/messageFetcher';

const isBlank = (content: string) => content.trim() === '';

const generateAllCapText = (message: string) =>
  message
    .trim()
    .toUpperCase()
    .split('')
    .reduce((outputText, character) => {
      return `${outputText + character} `;
    }, '');

const allCapExpandText = async ({
  content,
  channel,
  id,
  reference,
  author,
}: Message) => {
  if (author.bot) return; // return if sender is bot

  const cmdSpaceIndex = content.trimEnd().indexOf(' ');

  let chatContent = cmdSpaceIndex !== -1 ? content.slice(cmdSpaceIndex) : '';

  // If -allcap is detected and it has content
  if (!isBlank(chatContent)) {
    const mockText = generateAllCapText(chatContent);
    channel.send(mockText);
    return;
  }

  // If -allcap is detected but content is blank...
  if (reference && reference.messageID !== null) {
    // and it's referring to another message, fetch that message
    chatContent = await fetchMessageById(
      channel as TextChannel,
      reference.messageID
    );
  } else {
    // fetch the previous message in the channel
    chatContent = await fetchLastMessageBeforeId(channel as TextChannel, id);
  }

  // If it's still blank at this point, then exit
  if (isBlank(chatContent)) {
    return;
  }

  const allCapText = generateAllCapText(chatContent);
  channel.send(allCapText);
};

export default allCapExpandText;
