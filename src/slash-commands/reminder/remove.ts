import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import type { SlashCommandHandler, Subcommand } from '../builder';
import { removeReminder } from './utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('delete')
  .setDescription('Delete a reminder')
  .addStringOption((option) => option.setName('id').setDescription('Reminder ID. This must be provided').setRequired(true));

export const execute: SlashCommandHandler = async (interaction) => {
  const { user } = interaction.member!;
  const guildId = interaction.guildId!;
  const reminderId = interaction.options.getString('id', true);

  const op = await Result.safe(
    removeReminder({
      userId: user.id,
      guildId,
      reminderId,
    })
  );
  if (op.isErr()) {
    await interaction.reply(`Cannot delete reminder id ${reminderId}. Please try again later.`);
    return;
  }

  await interaction.reply(`Reminder ${reminderId} has been deleted.`);
};

const command: Subcommand = {
  data,
  execute,
};

export default command;
