import { TextChannel } from 'discord.js';

export const fetchWebhook = async (textChannel: TextChannel) => {
  const webHooks = await textChannel.fetchWebhooks();
  return webHooks.find(
    ({ name, channelID }) =>
      name === 'VAIT-Hook' && channelID === textChannel.id
  );
};

export const createWebhook = async (textChannel: TextChannel) => {
  const webhook = await textChannel.createWebhook('VAIT-Hook');
  return webhook;
};
