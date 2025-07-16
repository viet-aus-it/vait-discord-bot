import type { AocLeaderboard } from '@prisma/client';
import { differenceInMinutes, format } from 'date-fns';
import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { DAY_MONTH_YEAR_HOUR_MINUTE_FORMAT } from '../../utils/date';
import { logger } from '../../utils/logger';
import type { SlashCommand } from '../builder';
import { fetchAndSaveLeaderboard, getAocSettings, getSavedLeaderboard } from './utils';

export const DEFAULT_LEADERBOARD = 10;

const data = new SlashCommandBuilder()
  .setName('aoc-leaderboard')
  .setDescription("Fetch advent of code leaderboard. Will get current year, or the previous one if it isn't Dec yet.")
  .setContexts(InteractionContextType.Guild);

export function getAocYear(): number {
  const DECEMBER = 11;
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month < DECEMBER) {
    return year - 1;
  }

  return year;
}

export function formatLeaderboard({ result: leaderboard, updatedAt }: Pick<AocLeaderboard, 'result' | 'updatedAt'>): string {
  const memberScores = Object.values(leaderboard.members)
    .sort((prev, next) => next.local_score - prev.local_score)
    .slice(0, DEFAULT_LEADERBOARD);

  const nameLength = Math.max(...memberScores.map((m) => m.name.length));
  const scoreLength = Math.max(...memberScores.map((m) => m.local_score.toString().length));
  const titleString = `${'#'.padStart(2, ' ')} ${'name'.padStart(nameLength, ' ')} ${'score'.padStart(scoreLength, ' ')}\n`;

  const board = memberScores.reduce((accum, { name, local_score: score }, currentIndex) => {
    const position = (currentIndex + 1).toString().padStart(2, ' ');
    const paddedName = name.padStart(nameLength, ' ');
    const paddedScore = score.toString().padStart(scoreLength, ' ');
    return `${accum}${position} ${paddedName} ${paddedScore}\n`;
  }, titleString);

  const timestamp = format(updatedAt, DAY_MONTH_YEAR_HOUR_MINUTE_FORMAT);

  return `\`\`\`
${board}

Last updated at: ${timestamp}
\`\`\``;
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const guildId = interaction.guildId!;

  const getSavedleaderboardOp = await Result.safe(getSavedLeaderboard(guildId));
  const savedResult = getSavedleaderboardOp.unwrap();
  if (!getSavedleaderboardOp.isErr() && savedResult && differenceInMinutes(new Date(), savedResult.updatedAt) <= 15) {
    logger.info('[get-aoc-leaderboard]: Returning saved leaderboard data');
    const formattedLeaderboard = formatLeaderboard(savedResult);
    await interaction.editReply(formattedLeaderboard);
    return;
  }

  logger.info('[get-aoc-leaderboard]: Cannot find saved leaderboard, fetching new results');

  const settingsOp = await Result.safe(getAocSettings(guildId));
  if (settingsOp.isErr()) {
    const errorMessage = settingsOp.unwrapErr();
    logger.error(`[get-aoc-leaderboard]: Error getting AOC settings: ${errorMessage}`);
    await interaction.editReply(`ERROR: ${errorMessage}`);
    return;
  }

  const settings = settingsOp.unwrap();
  if (!settings || !settings.aocKey || !settings.aocLeaderboardId) {
    const errorMessage = 'Server is not configured to get AOC results! Missing Key and/or Leaderboard ID.';
    logger.error(`[get-aoc-leaderboard]: ${errorMessage}`);
    await interaction.editReply(`ERROR: ${errorMessage}`);
    return;
  }

  const year = getAocYear();
  const fetchAndSaveOp = await Result.safe(fetchAndSaveLeaderboard(year, settings));
  if (fetchAndSaveOp.isErr()) {
    const errorMessage = `Error fetching and/or saving new leaderboard result: ${fetchAndSaveOp.unwrapErr()}`;
    logger.error(`[get-aoc-leaderboard]: ${errorMessage}`);
    await interaction.editReply(`ERROR: ${errorMessage}`);
    return;
  }

  const leaderboardData = fetchAndSaveOp.unwrap();
  const message = formatLeaderboard(leaderboardData);
  await interaction.editReply(message);
};

const command: SlashCommand = {
  data,
  execute,
};

export default command;
