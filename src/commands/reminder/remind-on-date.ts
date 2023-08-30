import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { convertDateToEpoch } from '../../utils/dateUtils';
import { CommandHandler, Subcommand } from '../builder';
import { saveReminder } from './reminder-utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('on')
  .setDescription('Set reminder on a specific date.')
  .addStringOption((option) => option.setName('date').setDescription('The date to get a reminder on. Follow this format: DD/MM/YYYY hh:mm').setRequired(true))
  .addStringOption((option) => option.setName('message').setDescription('The message to get reminded for').setRequired(true));

export const execute: CommandHandler = async (interaction) => {
  const { user } = interaction.member!;
  const guildId = interaction.guildId!;
  const message = interaction.options.getString('message', true);
  const dateString = interaction.options.getString('date', true);
  const unixTimestamp = convertDateToEpoch(dateString);

  const op = await Result.safe(
    saveReminder({
      userId: user.id,
      guildId,
      message,
      timestamp: unixTimestamp,
    })
  );
  if (op.isErr()) {
    await interaction.reply(`Cannot save reminder for <@${user.id}>. Please try again later.`);
    return;
  }

  await interaction.reply(`New Reminder for <@${user.id}> set on <t:${op.unwrap().onTimestamp}> with the message: "${message}".`);
};

const command: Subcommand = {
  data,
  execute,
};

export default command;
