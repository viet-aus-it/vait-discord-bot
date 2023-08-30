import { TextChannel } from 'discord.js';

export const fetchLastMessageBeforeId = async (channel: TextChannel, id: string) => {
  const lastMessages = await channel.messages.fetch({ limit: 1, before: id });
  const messageRightBefore = lastMessages.first();
  if (!messageRightBefore) {
    throw new Error('Cannot fetch previous messages');
  }

  return messageRightBefore;
};
