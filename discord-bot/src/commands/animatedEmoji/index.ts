import { Message } from 'discord.js';
import { fetchWebhook, createWebhook } from '../../utils/webhookProcessor';

const animatedEmoji = async (originalMessage: Message) => {
  const { author, content, guild, channel } = originalMessage;

  if (author.bot) return; // return if bot sends the message

  const nitroRegex = /<a?:.+:\d+>/gim;
  const hasNitro = content.match(nitroRegex);
  if (hasNitro) return; // return if author has nitro

  const emojiRegex = new RegExp('(:.+:)+', 'gi');
  const hasEmoji = content.match(emojiRegex);
  if (!hasEmoji) return; // return if no emoji found

  let webhook = await fetchWebhook(channel);
  if (!webhook) {
    webhook = await createWebhook(channel); // create webhook if not found
  }
  if (!webhook) return; // return if can't find or create webhook

  let newMessage = content;
  const emojis = content.split(':').filter((e) => e !== '');
  console.log(`emoji: ${emojis}`);
  let emojiCount = 0;
  emojis.forEach((emoji) => {
    const emoteName = emoji.replace(/:/gim, '');
    const emote = guild?.emojis.cache.find(({ name }) => name === emoteName);
    if (!emote) return; // return if no matching emoji found on server
    if (!emote.animated) return; // return if emoji is not animated
    if (emote?.name !== emoteName) return; // return if doesn't match emoji's name

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
      avatarURL: author.avatarURL() ?? undefined,
    });
    await originalMessage.delete();
  } catch (error) {
    console.error(error);
  }
};
export default animatedEmoji;
