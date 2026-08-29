import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';

import { logger } from '../../utils/logger';
import { recordSpanError } from '../../utils/tracer';
import type { SlashCommand } from '../builder';

const data = new SlashCommandBuilder()
  .setName('command-name')
  .setDescription('What this command does')
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) => option.setName('option-name').setDescription('Description of the option').setRequired(true));

const execute = async (interaction: ChatInputCommandInteraction) => {
  const optionValue = interaction.options.getString('option-name', true);

  const op = await Result.safe(someOperation(optionValue));
  if (op.isErr()) {
    recordSpanError(op.unwrapErr(), 'err-command-name-action-failed');
    logger.error('[command-name]: Error message', op.unwrapErr());
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
    return;
  }

  await interaction.reply(`Response: ${optionValue}`);
};

export const commandName = execute;

const command: SlashCommand = {
  data,
  execute,
};

export default command;
