import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../builder';

const data = new SlashCommandBuilder()
  .setName('command-name')
  .setDescription('What this command does')
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName('option-name')
      .setDescription('Description of the option')
      .setRequired(true)
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const optionValue = interaction.options.getString('option-name', true);

  await interaction.reply(`Response: ${optionValue}`);
};

const command: SlashCommand = {
  data,
  execute,
};

export default command;
