// Parent command index.ts
import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../builder';
import subcommand1 from './subcommand1';
import subcommand2 from './subcommand2';

const data = new SlashCommandBuilder()
  .setName('command-group')
  .setDescription('Description for the command group')
  .setContexts(InteractionContextType.Guild)
  .addSubcommand(subcommand1.data)
  .addSubcommand(subcommand2.data);

const subcommands = [subcommand1, subcommand2];

const execute = async (interaction: ChatInputCommandInteraction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find((cmd) => cmd.data.name === requestedSubcommand);
  return subcommand?.execute(interaction);
};

const command: SlashCommand = {
  data,
  execute,
};

export default command;
