import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export type CommandHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;
export type AutocompleteHandler = (autocomplete: AutocompleteInteraction) => Promise<void>;
export type ContextMenuCommandInteractionHandler = (interaction: ContextMenuCommandInteraction) => Promise<void>;

export interface Command {
  data: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'> | SlashCommandSubcommandsOnlyBuilder;
  execute: CommandHandler;
  autocomplete?: AutocompleteHandler;
}

export interface Subcommand {
  data: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder);
  execute: CommandHandler;
}

export interface ContextMenuCommand {
  data: ContextMenuCommandBuilder;
  execute: ContextMenuCommandInteractionHandler;
}
