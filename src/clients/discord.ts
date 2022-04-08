import { Client, Intents } from 'discord.js';

export type ClientOptions = {
  token?: string;
};
export const getDiscordClient = (options: ClientOptions): Promise<Client> => {
  if (!options.token) throw new Error('please setup bot token');

  return new Promise((resolve, reject) => {
    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
      ],
    });
    client
      .on('ready', () => resolve(client))
      .on('error', reject)
      .login(options.token);
  });
};
