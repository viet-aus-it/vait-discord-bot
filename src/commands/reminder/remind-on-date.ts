import { SlashCommandSubcommandBuilder } from 'discord.js';
import { CommandHandler, Subcommand } from '../command';
import { saveReminder } from './reminder-utils';
import { convertDateToEpoch } from '../../utils/dateUtils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('on')
  .setDescription('Set reminder on a specific date.')
  .addStringOption((option) =>
    option
      .setName('date')
      .setDescription(
        'The date to get a reminder on. Follow this format: DD/MM/YYYY hh:mm'
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('The message to get reminded for')
      .setRequired(true)
  );

export const execute: CommandHandler = async (interaction) => {
  const { user } = interaction.member!;
  const guildId = interaction.guildId!;
  const message = interaction.options.getString('message', true);
  const dateString = interaction.options.getString('date', true);
  const unixTimestamp = convertDateToEpoch(dateString);

  const op = await saveReminder({
    userId: user.id,
    guildId,
    message,
    timestamp: unixTimestamp,
  });
  if (!op.success) {
    await interaction.reply(
      `Cannot save reminder for <@${user.id}>. Please try again later.`
    );
    return;
  }

  await interaction.reply(
    `New Reminder for <@${user.id}> set on <t:${op.data.onTimestamp}> with the message: "${message}".`
  );
};

const command: Subcommand = {
  data,
  execute,
};

export default command;
