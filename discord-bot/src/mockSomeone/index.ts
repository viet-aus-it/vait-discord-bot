import { Message, TextChannel } from 'discord.js';
import { getRandomBoolean } from '../utils/random';

const isBlank = (content: string) => content.trim() === '';

const fetchMessageById = async (
  channel: TextChannel,
  id: string
): Promise<string> => {
  try {
    const message = await channel.messages.fetch(id);
    if (!message) {
      throw new Error('Cannot fetch message');
    }
    return message.content;
  } catch (error) {
    console.error('CANNOT FETCH MESSAGE', error);
    return '';
  }
};

const fetchLastMessageBeforeId = async (
  channel: TextChannel,
  id: string
): Promise<string> => {
  try {
    const lastMessages = await channel.messages.fetch({ limit: 1, before: id });
    const messageRightBefore = lastMessages.first();
    if (!messageRightBefore) {
      throw new Error('Cannot fetch previous messages');
    }
    return messageRightBefore.content;
  } catch (error) {
    console.error('CANNOT FETCH MESSAGES IN CHANNEL', error);
    return '';
  }
};

const generateMockText = (message: string): string =>
  message
    .trim()
    .toLowerCase()
    .split('')
    .reduce((outputText, character): string => {
      const randomBoolean = getRandomBoolean();
      const spongeCharacter = randomBoolean
        ? character.toUpperCase()
        : character.toLowerCase();

      return `${outputText}${spongeCharacter}`;
    }, '');

const mockSomeone = async (msg: Message) => {
  const mockPrefix = '-mock';
  const { content, channel, id, reference } = msg;
  const hasMockPrefix = content.toLowerCase().startsWith(mockPrefix);
  if (!hasMockPrefix) return;

  let chatContent = content.slice(mockPrefix.length);

  // If -mock is detected and it's replying to another message, mock that message
  if (reference && reference.messageID !== null) {
    chatContent = await fetchMessageById(
      channel as TextChannel,
      reference.messageID
    );
  }

  // If -mock is detected but content is blank, fetch the previous message
  if (isBlank(chatContent)) {
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
