import { Message, TextChannel, Webhook } from 'discord.js';

const animatedEmoji = async (msg: Message) => {
  const { author, content, guild, channel } = msg;
  if (author.bot) return; // return if bot sends the message

  const emojiRegex = '(:.+:)+';
  const matches = content.match(emojiRegex);
  if (matches && matches.length < 1) return; // return if no emoji name found

  let webhook = (await (channel as TextChannel).fetchWebhooks()).find(
    ({ name, channelID }) => name === 'Jkiller-Hook' && channelID === channel.id
  );

  if (!webhook) {
    // create webhook if not found
    webhook = await (channel as TextChannel).createWebhook('Jkiller-Hook');
  }
  if (!webhook) return; // return if can't find or create webhook

  let message = content;
  const emojis = content.split(':').filter((e) => e !== '');
  emojis.forEach((emoji) => {
    const emoteName = emoji.replace(/:/gi, '');
    const emote = guild?.emojis.cache.find(({ name }) => name === emoteName);
    if (!emote) return; // return if no matching emoji found on server
    message = message.replace(
      new RegExp(`:${emoji}:`, 'gi'),
      emote.animated
        ? `<a:${emote.name}:${emote.id}>`
        : `<${emote.name}:${emote.id}>`
    ); // replace emoji name in the message with the actual emoji syntax
  });
  (webhook as Webhook).send(message, {
    username: author.username,
    avatarURL: author.avatarURL() ?? undefined,
  });
  msg.delete();
};
export default animatedEmoji;
