import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import type { Reminder } from '../../clients/prisma/generated/client';
import type { SlashCommandHandler, Subcommand } from '../builder';
import { getUserReminders } from './utils';

export const data = new SlashCommandSubcommandBuilder().setName('list').setDescription('Get a list of your reminders');

const formatReminders = (reminders: Reminder[]) => {
  const reminderList = reminders.reduce((accum, reminder) => {
    return `${accum}\nid: ${reminder.id}\nmessage: ${reminder.message}\non: <t:${reminder.onTimestamp}>\n`;
  }, '');
  return `${reminderList}`;
};

export const execute: SlashCommandHandler = async (interaction) => {
  const { user } = interaction.member!;
  const guildId = interaction.guildId!;
  const op = await Result.safe(getUserReminders(user.id, guildId));
  if (op.isErr()) {
    await interaction.reply('There is some error retrieving your reminders. Please try again later.');
    return;
  }

  const data = op.unwrap();
  if (data.length === 0) {
    await interaction.reply("You currently don't have any reminder set up.");
    return;
  }

  await interaction.reply(`Here are your reminders:\n${formatReminders(data)}`);
};

const command: Subcommand = {
  data,
  execute,
};

export default command;
