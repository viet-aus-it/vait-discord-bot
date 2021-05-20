import { Message, TextChannel, MessageEmbed } from 'discord.js';
import { fetchMessageObjectById } from '../../utils/messageFetcher';
import { fetchWebhook, createWebhook } from '../../utils/webhookProcessor';

const embedLink = async (msg: Message) => {
  const { author, content, guild, channel } = msg;

  let webhook = await fetchWebhook(channel);
  if (!webhook) {
    webhook = await createWebhook(channel); // create webhook if not found
  }

  if (!webhook) return; // return if can't find or create webhook
  if (author.bot) return; // return if bot sends the message

  const hasDiscordUrl = content.match(
    /https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+/gim
  );
  if (!hasDiscordUrl) return; // return if no discord url found

  const firstUrl = hasDiscordUrl[0];
  const idString = firstUrl.replace('https://discord.com/channels/', '');

  if (idString.trim().length === 0 || idString.split('/').length < 3) return; // return if link is wrong

  const [, channelId, messageId] = idString.split('/');
  const sourceChannel = guild?.channels.cache.find(
    ({ id }) => id === channelId
  );
  if (!sourceChannel) return; // return if source channel doesn't exist anymore

  let originalMessage = await fetchMessageObjectById(
    sourceChannel as TextChannel,
    messageId
  );
  if (typeof originalMessage === 'string') return; // return if original message doesn't exist anymore
  originalMessage = originalMessage as Message;
  const originalAuthor = originalMessage.author;
  const originalTime = originalMessage.createdTimestamp;
  const embed = new MessageEmbed()
    .setColor('#0072a8')
    .setAuthor(
      originalAuthor.username,
      originalAuthor.avatarURL() ?? undefined,
      firstUrl
    )
    .setDescription(originalMessage.content)
    .addFields({ name: 'Jump', value: `[Go to message](${firstUrl})` })
    .setTimestamp(originalTime)
    .setFooter(`#${sourceChannel.name}`);
  console.log('Before sending');
  try {
    await webhook.send(content.replace(firstUrl, ''), {
      embeds: [embed],
      username: author.username,
      avatarURL: author.avatarURL() ?? undefined,
    });
    await msg.delete();
  } catch (error) {
    console.error(error);
  }
};

export default embedLink;
