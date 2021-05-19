import { Channel, TextChannel } from 'discord.js';

export const fetchWebhook = async (channel: Channel) => {
  const textChannel = channel as TextChannel;
  const webHooks = await textChannel.fetchWebhooks();
  return webHooks.find(
    ({ name, channelID }) => name === 'VAIT-Hook' && channelID === channel.id
  );
};

export const createWebhook = async (channel: Channel) => {
  const textChannel = channel as TextChannel;
  const webhook = await textChannel.createWebhook('VAIT-Hook');
  return webhook;
};
