import { REST, RequestData, RouteLike } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { Command, ContextMenuCommand } from './builder';

interface DiscordRequestConfig {
  token: string;
  clientId: string;
  guildId: string;
}

interface DiscordRequestPayload {
  request: RouteLike;
  token: DiscordRequestConfig['token'];
  body: RequestData['body'];
}

const registerCommands = async ({
  request,
  token,
  body,
}: DiscordRequestPayload) => {
  const rest = new REST({ version: '10' }).setToken(token);
  try {
    await rest.put(request, { body });
    console.log('Successfully register slash commands');
  } catch (error: any) {
    console.error(error);
    throw new Error('Cannot deploy commands', error.toString());
  }
};

export const deployGuildCommands = async (
  commandList: Command[],
  contextMenuCommandList: ContextMenuCommand[],
  config: DiscordRequestConfig
) => {
  const { token, clientId, guildId } = config;

  const commands = [...commandList, ...contextMenuCommandList].map((cmd) =>
    cmd.data.toJSON()
  );

  const request = Routes.applicationGuildCommands(clientId, guildId);
  return registerCommands({ request, token, body: commands });
};

export const deployGlobalCommands = async (
  commandList: Command[],
  contextMenuCommandList: ContextMenuCommand[],
  config: Omit<DiscordRequestConfig, 'guildId'>
) => {
  const { token, clientId } = config;

  const commands = [...commandList, ...contextMenuCommandList].map((cmd) =>
    cmd.data.toJSON()
  );

  const request = Routes.applicationCommands(clientId);
  return registerCommands({ request, token, body: commands });
};
