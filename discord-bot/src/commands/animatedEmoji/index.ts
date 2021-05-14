import { Message } from 'discord.js';

const animatedEmoji = async (msg: Message) => {
  const { author, content, guild } = msg;
  if (author.bot) return; // return if bot sends the message
  const emojiRegex = '(:.+:)+';
  const matches = content.match(emojiRegex);
  if (matches && matches.length < 1) return;
  const emojis = content.split(':').filter((e) => e !== '');
  if (emojis) {
    let message = content;
    emojis.forEach((emoji) => {
      const emoteName = emoji.replace(/:/gi, '');
      const emote = guild?.emojis.cache.find(({ name }) => name === emoteName);
      if (emote) {
        message = message.replace(
          new RegExp(`:${emoji}:`, 'gi'),
          emote.animated
            ? `<a:${emote.name}:${emote.id}>`
            : `<${emote.name}:${emote.id}>`
        ); // replace emoji name in the message with the actual emoji syntax
      }
    });

    const sendMess = guild?.fetchWebhooks().then((value) => {
      const webhook = value.find(
        ({ name, guildID }) => name === 'Jkiller-Hook' && guildID === guild.id
      );
      if (!webhook) return; // return if no webhook installed
      msg.delete();
      return webhook.send(message, {
        username: author.username,
        avatarURL: author.avatarURL() || undefined,
      });
    });
    return sendMess;
  }
};

export default animatedEmoji;
