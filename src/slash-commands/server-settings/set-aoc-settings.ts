import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommandHandler, Subcommand } from '../builder';
import { setAocSettings } from './utils';

export const data = new SlashCommandSubcommandBuilder()
  .setName('set-advent-of-code-key')
  .setDescription('ADMIN COMMAND. Set key to get Advent of Code stats')
  .addStringOption((option) => option.setName('key').setDescription('Advent of Code session key').setRequired(true))
  .addStringOption((option) => option.setName('leaderboard-id').setDescription('Advent of Code leaderboard Id').setRequired(true));

export const execute: SlashCommandHandler = async (interaction) => {
  const guildId = interaction.guildId!;
  const key = interaction.options.getString('key', true);
  const leaderboardId = interaction.options.getString('leaderboard-id', true);
  logger.info(`[set-aoc-key]: ${interaction.member!.user.username} is setting the Advent of Code key.`);

  const op = await Result.safe(setAocSettings(guildId, key, leaderboardId));
  if (op.isErr()) {
    logger.info(`[set-aoc-key]: ${interaction.member!.user.username} failed to set AOC Key. Error: ${op.unwrapErr()}`);
    await interaction.reply(`Cannot set this AOC key. Please try again. Error: ${op.unwrapErr()}`);
    return;
  }

  logger.info(`[set-aoc-key]: ${interaction.member!.user.username} successfully set AOC key for guild ${guildId}`);
  await interaction.reply('Successfully saved setting. You can now get AOC Leaderboard.');
};

const command: Subcommand = {
  data,
  execute,
};

export default command;
