import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Subcommand } from '../builder';
import { getTop10 } from './_helpers';

const data = new SlashCommandSubcommandBuilder().setName('leaderboard').setDescription('Show rep leaderboard');

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
  const records = await getTop10();
  if (records.length === 0) {
    await interaction.reply('No one has rep to be on the leaderboard, yet.');
    return;
  }

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

  const body = buildRepLeaderboard(mergeRecords);
  await interaction.reply(`\`\`\`\n${body}\`\`\``);
};

const subcommand: Subcommand = {
  data,
  execute: getLeaderboard,
};

export default subcommand;
