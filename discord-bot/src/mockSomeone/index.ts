import { Message } from 'discord.js';
import { getRandomBoolean } from '../utils/random';

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

const mockSomeone = (msg: Message) => {
  const { content } = msg;
  const hasMockPrefix = content.startsWith('-mock');
  if (!hasMockPrefix) return;

  const chatContent = content.slice(5);
  const isBlank = chatContent.trim() === "";
  if (isBlank) return;

  const mockText = generateMockText(chatContent);

  msg.channel.send(mockText);
};

export default mockSomeone;
