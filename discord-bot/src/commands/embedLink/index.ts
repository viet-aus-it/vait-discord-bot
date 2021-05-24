import { Message, TextChannel, MessageEmbed } from 'discord.js';
import { fetchMessageObjectById } from '../../utils/messageFetcher';
import { fetchWebhook, createWebhook } from '../../utils/webhookProcessor';

const createEmbeddedMessage = (
  { author, createdTimestamp, content }: Message,
  { name: channelName }: TextChannel,
  firstUrl: string
) => {
  const { username, avatarURL } = author;
  const embed = new MessageEmbed()
    .setColor('#0072a8')
    .setAuthor(username, avatarURL() ?? undefined, firstUrl)
    .setDescription(content)
    .addFields({ name: 'Jump', value: `[Go to message](${firstUrl})` })
    .setTimestamp(createdTimestamp)
    .setFooter(`#${channelName}`);

  return embed;
};

const embedLink = async (msg: Message) => {
  const { author, content, guild, channel } = msg;

  if (author.bot) return; // return if bot sends the message

  const currentTextChannel = channel as TextChannel;
  let webhook = await fetchWebhook(currentTextChannel);
  if (!webhook) {
    webhook = await createWebhook(currentTextChannel); // create webhook if not found
  }
  if (!webhook) return; // return if can't find or create webhook

  const messageURLRegex = /https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+/gim;
  const hasDiscordUrl = content.match(messageURLRegex);
  if (!hasDiscordUrl) return; // return if no discord url found

  const [firstUrl] = hasDiscordUrl;
  const idString = firstUrl.replace('https://discord.com/channels/', '');
  if (idString.trim().length === 0 || idString.split('/').length < 3) return; // return if link is wrong

  const [, channelId, messageId] = idString.split('/');
  const sourceChannel = guild?.channels.cache.find(
    ({ id }) => id === channelId
  );
  if (!sourceChannel) return; // return if source channel doesn't exist anymore

  const sourceTextChannel = sourceChannel as TextChannel;
  const originalMessage = await fetchMessageObjectById(
    sourceTextChannel,
    messageId
  );
  if (!originalMessage) return; // return if original message doesn't exist anymore

  const embed = createEmbeddedMessage(
    originalMessage,
    sourceTextChannel,
    firstUrl
  );

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
