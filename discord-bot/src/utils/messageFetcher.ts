import { Message, TextChannel } from 'discord.js';

const handleFetchMessageError = (error: Error) => {
  console.error('CANNOT FETCH MESSAGES IN CHANNEL', error);
  return '';
};

export const fetchMessageById = async (channel: TextChannel, id: string) => {
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

export const fetchMessageObjectById = async (
  channel: TextChannel,
  id: string
): Promise<Message | string> => {
  try {
    const message = await channel.messages.fetch(id);
    if (!message) {
      throw new Error('Cannot fetch message');
    }
    return message;
  } catch (error) {
    return handleFetchMessageError(error);
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
    return handleFetchMessageError(error);
  }
};
