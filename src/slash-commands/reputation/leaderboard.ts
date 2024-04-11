import { type ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { logger } from '../../utils/logger';
import type { Subcommand } from '../builder';
import { getRepLeaderboard } from './utils';

export const DEFAULT_LEADERBOARD = 10;
export const MAX_LEADERBOARD = 25;

const data = new SlashCommandSubcommandBuilder()
  .setName('leaderboard')
  .setDescription('Show rep leaderboard')
  .addNumberOption((option) =>
    option.setName('size').setDescription(`Number of users to show. Default: ${DEFAULT_LEADERBOARD}. Max: ${MAX_LEADERBOARD}`).setRequired(false)
  );

export const buildRepLeaderboard = (
  records: {
    username: string;
    reputation: number;
  }[]
) => {
  const repLength = Math.max(...records.map((record) => String(record.reputation).length), 'rep'.length);
  const usernameLength = Math.max(...records.map((record) => record.username.length), 'nickname'.length);
  const titleString = `${'#'.padStart(2, ' ')} ${'username'.padStart(usernameLength, ' ')} ${'rep'.padStart(repLength, ' ')}\n`;
  return records.reduce((accum, { username, reputation }, currentIndex) => {
    const position = String(currentIndex + 1).padStart(2, ' ');
    const paddedUsername = username.padStart(usernameLength, ' ');
    const repString = String(reputation).padStart(repLength, ' ');
    return `${accum}${position} ${paddedUsername} ${repString}\n`;
  }, titleString);
};

export const getLeaderboard = async (interaction: ChatInputCommandInteraction) => {
  const size = interaction.options.getNumber('size', false) ?? DEFAULT_LEADERBOARD;
  if (size > MAX_LEADERBOARD) {
    logger.info('[rep-leaderboard]: size is too big', size);
    await interaction.reply(`The size is too big. Max is ${MAX_LEADERBOARD}`);
    return;
  }

  const records = await getRepLeaderboard(size);
  if (records.length === 0) {
    logger.info('[rep-leaderboard]: no one has rep in this server.');
    await interaction.reply('No one has rep to be on the leaderboard, yet.');
    return;
  }

  logger.info('[rep-leaderboard]: got top leaderboard');
  const guild = interaction.guild!;
  const guildMembers = await guild.members.fetch({
    user: records.map((r) => r.id),
  });
  const mergeRecords = records.map((r) => {
    const member = guildMembers.get(r.id);
    if (!member) {
      return {
        ...r,
        username: String(r.id),
      };
    }

    const { nickname, displayName } = member;
    return {
      ...r,
      username: nickname || displayName,
    };
  });

  logger.info('[rep-leaderboard]: building leaderboard');
  const body = buildRepLeaderboard(mergeRecords);
  logger.info('[rep-leaderboard]: Sending leaderboard back');
  await interaction.reply(`\`\`\`\n${body}\`\`\``);
};

const subcommand: Subcommand = {
  data,
  execute: getLeaderboard,
};

export default subcommand;
