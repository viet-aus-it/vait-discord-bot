import { Client } from "discord.js";

export type ClientOptions = {
  token?: string
}
export const getDiscordClient = (options: ClientOptions): Promise<Client> => {
  if(!options.token) throw new Error('Please setup bot token')

  return new Promise((resolve, reject) => {
    const client = new Client();
    client
      .on('ready', () => resolve(client))
      .on('error', reject)
      .login(options.token);
  })
}