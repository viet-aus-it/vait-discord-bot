import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export type SlashCommandHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;
export type AutocompleteHandler = (autocomplete: AutocompleteInteraction) => Promise<void>;

export interface SlashCommand {
  data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: SlashCommandHandler;
  autocomplete?: AutocompleteHandler;
}

export interface Subcommand {
  data: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder);
  execute: SlashCommandHandler;
  autocomplete?: AutocompleteHandler;
}
