import type { ContextMenuCommandBuilder, ContextMenuCommandInteraction } from 'discord.js';

export type ContextMenuCommandInteractionHandler = (interaction: ContextMenuCommandInteraction) => Promise<void>;

export interface ContextMenuCommand {
  data: ContextMenuCommandBuilder;
  execute: ContextMenuCommandInteractionHandler;
}
