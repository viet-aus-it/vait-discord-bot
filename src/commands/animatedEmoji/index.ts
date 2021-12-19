import { Message, TextChannel } from 'discord.js';
import { fetchOrCreateWebhook } from '../../utils';

export const animatedEmoji = async (originalMessage: Message) => {
  const { author, content, guild, channel } = originalMessage;

  if (!guild) return; // return if message is not sent from within a guild

  if (author.bot) return; // return if bot sends the message

  const nitroRegex = /<a?:.+:\d+>/gim;
  const hasNitro = content.match(nitroRegex);
  if (hasNitro) return; // return if author has nitro

  const emojiRegex = /(:.+:+)/gi;
  const hasEmoji = content.match(emojiRegex);
  if (!hasEmoji) return; // return if no emoji found

  const currentTextChannel = channel as TextChannel;
  const webhook = await fetchOrCreateWebhook(currentTextChannel, 'VAIT-Hook');
  if (!webhook) return;

  let newMessage = content;
  const emojis = content.split(':').filter((e) => e !== '');
  let emojiCount = 0;
  emojis.forEach((emoji) => {
    const emoteName = emoji.replace(/:/gim, '');
    const emote = guild.emojis.cache.find(
      ({ name, animated }) => name === emoteName && animated
    );
    if (!emote) return; // return if no matching emoji found on server

    newMessage = newMessage.replace(
      new RegExp(`:${emoji}:`, 'gi'),
      `<a:${emote.name}:${emote.id}>`
    ); // replace emoji name in the message with the actual emoji syntax
    emojiCount += 1;
  });

  if (emojiCount === 0) return; // return if no emoji found

  try {
    await webhook.send(newMessage, {
      username: author.username,
      avatarURL: author.avatarURL() || undefined,
    });
    await originalMessage.delete();
  } catch (error) {
    console.error(error);
  }
};
