import { Message, TextChannel } from 'discord.js';
import { fetchMessageObjectById } from '../../utils/messageFetcher';
import { isBlank } from '../../utils/isBlank';
import { randomInsultGenerator } from './insultGenerator';

const sendInsult = async (insult: string, channel: TextChannel) => {
  try {
    await channel.send(insult);
  } catch (error) {
    console.error('CANNOT SEND MESSAGE', error);
  }
};

const insult = async ({ content, reference, channel, author }: Message) => {
  if (author.bot) return;

  const textChannel = channel as TextChannel;

  const firstSpaceChar = content.trimEnd().indexOf(' ');

  const insultText = randomInsultGenerator() as string;

  let chatContent =
    firstSpaceChar !== -1 ? content.slice(firstSpaceChar).trimStart() : '';

  // If there is chat content
  if (!isBlank(chatContent)) {
    const replyText = `${chatContent}, ${insultText.toLowerCase()}`;
    sendInsult(replyText, textChannel);
    return;
  }

  // If there is a reference to a msg
  if (reference && reference.messageID !== null) {
    // Then insult the author of the refered message
    const referredMsg = (await fetchMessageObjectById(
      channel as TextChannel,
      reference.messageID
    )) as Message;

    const referedAuthorId = referredMsg.author.id;
    chatContent = `<@!${referedAuthorId}>, ${insultText.toLowerCase()}`;
    sendInsult(chatContent, textChannel);
    return;
  }

  // If there is no content or reference
  sendInsult(insultText, textChannel);
};

export default insult;
