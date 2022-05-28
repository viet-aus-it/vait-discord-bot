import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { REST, RequestData, RouteLike } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

export type CommandHandler = (interaction: CommandInteraction) => Promise<void>;
export type AutocompleteHandler = (
  autocomplete: AutocompleteInteraction
) => Promise<void>;

export interface Command {
  data:
    | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
    | SlashCommandSubcommandsOnlyBuilder;
  execute: CommandHandler;
  autocomplete?: AutocompleteHandler;
}

export interface Subcommand {
  data:
    | SlashCommandSubcommandBuilder
    | ((
        subcommandGroup: SlashCommandSubcommandBuilder
      ) => SlashCommandSubcommandBuilder);
  execute: CommandHandler;
}

interface DiscordRequestConfig {
  token: string;
  clientId: string;
  guildId: string;
}

type DiscordRequestPayload = {
  request: RouteLike;
  token: DiscordRequestConfig['token'];
  body: RequestData['body'];
};

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
    throw new Error('Cannot deploy commands', error.toString());
  }
};

export const deployGuildCommands = async (
  commandList: Command[],
  config: DiscordRequestConfig
) => {
  const { token, clientId, guildId } = config;

  const commands = commandList.map((cmd) => cmd.data.toJSON());

  const request = Routes.applicationGuildCommands(clientId, guildId);
  return registerCommands({ request, token, body: commands });
};

export const deployGlobalCommands = async (
  commandList: Command[],
  config: Omit<DiscordRequestConfig, 'guildId'>
) => {
  const { token, clientId } = config;

  const commands = commandList.map((cmd) => cmd.data.toJSON());

  const request = Routes.applicationCommands(clientId);
  return registerCommands({ request, token, body: commands });
};
