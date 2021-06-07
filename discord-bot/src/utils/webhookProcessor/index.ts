import { TextChannel } from 'discord.js';

export const fetchWebhook = async (
  textChannel: TextChannel,
  hookName: string
) => {
  const webHooks = await textChannel.fetchWebhooks();
  return webHooks.find(
    ({ name, channelID }) => name === hookName && channelID === textChannel.id
  );
};

export const createWebhook = async (
  textChannel: TextChannel,
  hookName: string
) => {
  const webhook = await textChannel.createWebhook(hookName);
  return webhook;
};

export const fetchOrCreateWebhook = async (
  textChannel: TextChannel,
  hookName: string
) => {
  let webhook = await fetchWebhook(textChannel, hookName);
  if (!webhook) {
    // Create new webhook if not found
    webhook = await createWebhook(textChannel, hookName);
  }

  if (!webhook) {
    // Return undefined if cannot be found or created
    return;
  }

  return webhook;
};
