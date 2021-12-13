import { TextChannel } from 'discord.js';

const handleFetchMessageError = (
  error: Error,
  returnObject: string | undefined = undefined
) => {
  console.error('CANNOT FETCH MESSAGES IN CHANNEL', error);
  return returnObject;
};

export const fetchMessageObjectById = async (
  channel: TextChannel,
  id: string
) => {
  try {
    const message = await channel.messages.fetch(id);
    if (!message) {
      throw new Error('Cannot fetch message');
    }
    return message;
  } catch (error) {
    return handleFetchMessageError(error, undefined) as undefined;
  }
};

export const fetchMessageById = async (channel: TextChannel, id: string) => {
  try {
    const message = await fetchMessageObjectById(channel, id);
    if (!message) {
      throw new Error('Cannot fetch message');
    }
    return message.content;
  } catch (error) {
    return handleFetchMessageError(error, '') as string;
  }
};

export const fetchLastMessageBeforeId = async (
  channel: TextChannel,
  id: string
) => {
  try {
    const lastMessages = await channel.messages.fetch({ limit: 1, before: id });
    const messageRightBefore = lastMessages.first();
    if (!messageRightBefore) {
      throw new Error('Cannot fetch previous messages');
    }
    return messageRightBefore.content;
  } catch (error) {
    return handleFetchMessageError(error, '') as string;
  }
};
