import { REST, type RequestData, type RouteLike } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import type { ContextMenuCommand } from './context-menu-commands/builder';
import type { SlashCommand } from './slash-commands/builder';

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

const registerCommands = async ({ request, token, body }: DiscordRequestPayload) => {
  const rest = new REST({ version: '10' }).setToken(token);
  return rest.put(request, { body });
};

export const deployGuildCommands = async (commandList: Array<SlashCommand | ContextMenuCommand>, config: DiscordRequestConfig) => {
  const { token, clientId, guildId } = config;

  const commands = commandList.map((cmd) => cmd.data.toJSON());

  const request = Routes.applicationGuildCommands(clientId, guildId);
  return registerCommands({ request, token, body: commands });
};

export const deployGlobalCommands = async (commandList: Array<SlashCommand | ContextMenuCommand>, config: Omit<DiscordRequestConfig, 'guildId'>) => {
  const { token, clientId } = config;

  const commands = commandList.map((cmd) => cmd.data.toJSON());

  const request = Routes.applicationCommands(clientId);
  return registerCommands({ request, token, body: commands });
};
