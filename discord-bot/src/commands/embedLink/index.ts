import { Message, TextChannel, MessageEmbed } from 'discord.js';
import { fetchMessageObjectById } from '../../utils/messageFetcher';
import { fetchOrCreateWebhook } from '../../utils/webhookProcessor';

const createEmbeddedMessage = (
  { author, createdTimestamp, content }: Message,
  { name: channelName }: TextChannel,
  firstUrl: string
) => {
  const { username, avatarURL } = author;
  const embed = new MessageEmbed({
    color: '#0072a8',
    author: {
      name: username,
      iconURL: avatarURL() || '',
      url: firstUrl,
    },
    description: content,
    timestamp: createdTimestamp,
    footer: { text: `#${channelName}` },
    fields: [{ name: 'Jump', value: `[Go to message](${firstUrl})` }],
  });

  return embed;
};

const embedLink = async (msg: Message) => {
  const { author, content, guild, channel } = msg;

  // return if guild is invalid.
  // Guild is only invalid if we're sending a private DM.
  // Which this bot shouldn't be able to do anyway.
  if (!guild) return;

  if (author.bot) return; // return if bot sends the message

  const currentTextChannel = channel as TextChannel;
  const webhook = await fetchOrCreateWebhook(
    currentTextChannel,
    'VAIT-EmbedLink-Hook'
  );
  if (!webhook) return;

  const messageURLRegex = /https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+/gim;
  const hasDiscordUrl = content.match(messageURLRegex);
  if (!hasDiscordUrl) return; // return if no discord url found

  const [firstUrl] = hasDiscordUrl;
  const idString = firstUrl.replace('https://discord.com/channels/', '');
  if (idString.trim().length === 0 || idString.split('/').length < 3) return; // return if link is wrong

  const [, channelId, messageId] = idString.split('/');
  const sourceChannel = guild.channels.cache.find(({ id }) => id === channelId);
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
