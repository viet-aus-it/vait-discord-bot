import { SlashCommandSubcommandBuilder } from 'discord.js';
import { addSeconds, getUnixTime } from 'date-fns';
import parseDuration from 'parse-duration';
import { CommandHandler, Subcommand } from '../command';
import { saveReminder } from './reminder-utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('in')
  .setDescription('Set reminder in ... minute/hours/days from now.')
  .addStringOption((option) =>
    option
      .setName('duration')
      .setDescription(
        'The time from now you wanted to be reminded. e.g. 1hour 20minutes'
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
  const duration = interaction.options.getString('duration', true);
  const parsedDuration = parseDuration(duration, 'second');
  if (!parsedDuration) {
    await interaction.reply(
      'Invalid duration. Please specify a duration to get reminded.'
    );
    return;
  }

  const unixTimestamp = getUnixTime(addSeconds(new Date(), parsedDuration));
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
