import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { convertDateToEpoch } from '../../utils/date-utils';
import type { CommandHandler, Subcommand } from '../builder';
import { updateReminder } from './utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('update')
  .setDescription('Update a reminder')
  .addStringOption((option) => option.setName('id').setDescription('Reminder ID. This must be provided.').setRequired(true))
  .addStringOption((option) => option.setName('date').setDescription('The date to get a reminder on. Follow this format: DD/MM/YYYY hh:mm').setRequired(false))
  .addStringOption((option) => option.setName('message').setDescription('The message to get reminded for').setRequired(false));

export const execute: CommandHandler = async (interaction) => {
  const { user } = interaction.member!;
  const guildId = interaction.guildId!;
  const reminderId = interaction.options.getString('id', true);
  const message = interaction.options.getString('message');
  const dateString = interaction.options.getString('date');
  if (!message && !dateString) {
    await interaction.reply('Nothing to update. Skipping...');
    return;
  }

  const op = await Result.safe(
    updateReminder({
      userId: user.id,
      guildId,
      reminderId,
      message: message ?? undefined,
      timestamp: dateString ? convertDateToEpoch(dateString) : undefined,
    })
  );
  if (op.isErr()) {
    await interaction.reply(`Cannot update reminder for <@${user.id}> and reminder id ${reminderId}. Please try again later.`);
    return;
  }

  await interaction.reply(`Reminder ${reminderId} has been updated to remind on <t:${op.unwrap().onTimestamp}> with the message: "${message}".`);
};

const command: Subcommand = {
  data,
  execute,
};

export default command;
