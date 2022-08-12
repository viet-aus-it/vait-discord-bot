import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../command.js';
import { getRandomIntInclusive } from '../../utils/index.js';

const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Ask the magic 8ball a question')
  .addStringOption((option) =>
    option
      .setName('question')
      .setDescription('Question to ask the magic 8ball.')
      .setRequired(true)
  );

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
const get8BallReply = () =>
  REPLIES[getRandomIntInclusive(0, REPLIES.length - 1)];

export const ask8Ball = async (interaction: ChatInputCommandInteraction) => {
  const question = interaction.options.getString('question', true);

  const embedMessage = new EmbedBuilder({
    author: {
      name: question,
    },
    description: get8BallReply(),
  });
  await interaction.reply({ embeds: [embedMessage] });
};

const command: Command = {
  data,
  execute: ask8Ball,
};

export default command;
