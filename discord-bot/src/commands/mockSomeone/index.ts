import { Message, TextChannel } from 'discord.js';
import { getRandomBoolean } from '../../utils/random';

const isBlank = (content: string) => content.trim() === '';

const generateMockText = (message: string) =>
  message
    .trim()
    .toLowerCase()
    .split('')
    .reduce((outputText, character) => {
      const randomBoolean = getRandomBoolean();
      const spongeCharacter = randomBoolean
        ? character.toUpperCase()
        : character.toLowerCase();

      return `${outputText}${spongeCharacter}`;
    }, '');

const handleFetchMessageError = (error: Error) => {
  console.error('CANNOT FETCH MESSAGES IN CHANNEL', error);
  return '';
};

const fetchMessageById = async (channel: TextChannel, id: string) => {
  try {
    const message = await channel.messages.fetch(id);
    if (!message) {
      throw new Error('Cannot fetch message');
    }
    return message.content;
  } catch (error) {
    return handleFetchMessageError(error);
  }
};

const fetchLastMessageBeforeId = async (channel: TextChannel, id: string) => {
  try {
    const lastMessages = await channel.messages.fetch({ limit: 1, before: id });
    const messageRightBefore = lastMessages.first();
    if (!messageRightBefore) {
      throw new Error('Cannot fetch previous messages');
    }
    return messageRightBefore.content;
  } catch (error) {
    return handleFetchMessageError(error);
  }
};

const mockSomeone = async ({ content, channel, id, reference }: Message) => {
  const indexOfMockPrefix = content.trimEnd().indexOf(' ');

  let chatContent =
    indexOfMockPrefix !== -1 ? content.slice(indexOfMockPrefix) : '';

  // If -mock is detected and it has content
  if (!isBlank(chatContent)) {
    const mockText = generateMockText(chatContent);
    channel.send(mockText);
    return;
  }

  // If -mock is detected but content is blank...
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

  const mockText = generateMockText(chatContent);
  channel.send(mockText);
};

export default mockSomeone;
