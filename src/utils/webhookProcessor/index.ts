import { TextChannel } from 'discord.js';

export const fetchWebhook = async (
  textChannel: TextChannel,
  hookName: string
) => {
  const webHooks = await textChannel.fetchWebhooks();
  return webHooks.find(
    ({ name, channelId, token }) =>
      name === hookName &&
      channelId === textChannel.id &&
      token === process.env.TOKEN
  );
};

export const createWebhook = async (
  textChannel: TextChannel,
  hookName: string
) => textChannel.createWebhook(hookName);

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
    // Return undefined if webhook cannot be found or created
    return;
  }

  return webhook;
};
