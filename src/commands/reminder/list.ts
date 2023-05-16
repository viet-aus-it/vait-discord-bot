import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Reminder } from '@prisma/client';
import { CommandHandler, Subcommand } from '../command';
import { getUserReminders } from './reminder-utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('list')
  .setDescription('Get a list of your reminders');

const formatReminders = (reminders: Reminder[]) => {
  const reminderList = reminders.reduce((accum, reminder) => {
    return `${accum}\nid: ${reminder.id}\nmessage: ${reminder.message}\non: <t:${reminder.onTimestamp}>\n`;
  }, '');
  return `${reminderList}`;
};

export const execute: CommandHandler = async (interaction) => {
  const { user } = interaction.member!;
  const guildId = interaction.guildId!;
  const op = await getUserReminders(user.id, guildId);
  if (!op.success) {
    await interaction.reply(
      'There is some error retrieving your reminders. Please try again later.'
    );
    return;
  }

  if (op.data.length === 0) {
    await interaction.reply("You currently don't have any reminder set up.");
    return;
  }

  await interaction.reply(
    `Here are your reminders:\n${formatReminders(op.data)}`
  );
};

const command: Subcommand = {
  data,
  execute,
};

export default command;
