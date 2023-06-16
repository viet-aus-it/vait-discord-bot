import { Message, TextChannel } from 'discord.js';
import { OpPromise } from '../opResult';

export const fetchLastMessageBeforeId = async (
  channel: TextChannel,
  id: string
): OpPromise<Message> => {
  try {
    const lastMessages = await channel.messages.fetch({ limit: 1, before: id });
    const messageRightBefore = lastMessages.first();
    if (!messageRightBefore) {
      throw new Error('Cannot fetch previous messages');
    }
    return {
      success: true,
      data: messageRightBefore,
    };
  } catch (error) {
    return {
      error,
      success: false,
    };
  }
};

export const fetchMessageById = async (channel: TextChannel, id: string) => {
  try {
    const message = await channel.messages.fetch(id);
    if (!message) {
      throw new Error('Cannot fetch message');
    }
    return message;
  } catch (error: any) {
    console.error('CANNOT FETCH MESSAGE IN CHANNEL', error);
    return undefined;
  }
};
