import { Message, TextChannel } from 'discord.js';
import {
  fetchMessageById,
  fetchLastMessageBeforeId,
  getRandomBoolean,
  isBlank,
} from '../../utils';

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

const mockSomeone = async ({
  content,
  channel,
  id,
  reference,
  author,
}: Message) => {
  if (author.bot) return; // return if sender is bot

  const indexOfMockPrefix = content.trimEnd().indexOf(' ');

  let chatContent =
    indexOfMockPrefix !== -1 ? content.slice(indexOfMockPrefix) : '';

  // If -mock is detected and it has content
  if (!isBlank(chatContent)) {
    const mockText = generateMockText(chatContent);
    await channel.send(mockText);
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
  await channel.send(mockText);
};

export default mockSomeone;
