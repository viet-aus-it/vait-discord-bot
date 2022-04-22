import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

type CommandHandler = (interaction: CommandInteraction) => Promise<void>;

export interface Command {
  data:
    | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
    | SlashCommandSubcommandsOnlyBuilder;
  execute: CommandHandler;
}

export interface Subcommand {
  data:
    | SlashCommandSubcommandBuilder
    | ((
        subcommandGroup: SlashCommandSubcommandBuilder
      ) => SlashCommandSubcommandBuilder);
  execute: CommandHandler;
}

interface ConfigType {
  token: string;
  clientId: string;
  guildId: string;
}

export const deployCommands = async (
  commandList: Command[],
  config: ConfigType
) => {
  const { token, clientId, guildId } = config;
  const commands = commandList.map((cmd) => cmd.data.toJSON());

  const rest = new REST({ version: '10' }).setToken(token);
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log('Successfully register slash commands');
  } catch (error: any) {
    throw new Error('Cannot deploy commands', error.toString());
  }
};
