import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { logger } from '../../utils/logger';
import { getRandomIntInclusive } from '../../utils/random';
import type { SlashCommand } from '../builder';

const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Ask the magic 8ball a question')
  .addStringOption((option) => option.setName('question').setDescription('Question to ask the magic 8ball.').setRequired(true))
  .setContexts(InteractionContextType.Guild);

const REPLIES = [
  'Yes',
  'No',
  'Hell Yes',
  'Hell No',
  'Ye Nah',
  'Nah Ye',
  'Fk No',
  'Fk Ye',
  'Go for it',
  "Don't even think about it",
  'Are you even trying?',
  'Keep it up',
] as const;

const get8BallReply = () => REPLIES[getRandomIntInclusive(0, REPLIES.length - 1)];

export const ask8Ball = async (interaction: ChatInputCommandInteraction) => {
  const question = interaction.options.getString('question', true);
  const reply = get8BallReply();
  logger.info(`[8ball]: Q: ${question} - A: ${reply}`);
  await interaction.reply(`Q: ${question}\nA: ${reply}`);
};

const command: SlashCommand = {
  data,
  execute: ask8Ball,
};

export default command;
