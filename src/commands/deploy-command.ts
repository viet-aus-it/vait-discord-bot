import { REST, RequestData, RouteLike } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { Command, ContextMenuCommand } from './builder';
import { OpPromise } from '../utils/opResult';

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
}: DiscordRequestPayload): OpPromise => {
  try {
    const rest = new REST({ version: '10' }).setToken(token);
    return {
      success: true,
      data: await rest.put(request, { body }),
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
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
