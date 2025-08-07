import { type ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { logger } from '../../utils/logger';
import type { SlashCommand } from '../builder';
import { DISCLAIMERS, type DisclaimerMap } from './disclaimers_meta';

const data = new SlashCommandBuilder()
  .setName('disclaimer')
  .setDescription('Get the VAIT disclaimer')
  .addStringOption((option) =>
    option
      .setName('type')
      .setDescription('Choose the type of disclaimer')
      .setRequired(false)
      .addChoices({ name: 'General', value: 'general' }, { name: 'Financial Advice', value: 'financial' })
  )
  .addStringOption((option) =>
    option
      .setName('lang')
      .setDescription('Choose a language for the disclaimer (Vietnamese / English)')
      .setRequired(false)
      .addChoices({ name: 'English', value: 'en' }, { name: 'Vietnamese', value: 'vi' })
  )
  .setContexts(InteractionContextType.Guild);

export const getDisclaimer = async (interaction: ChatInputCommandInteraction) => {
  const type = interaction.options.getString('type') ?? 'general';
  const lang = interaction.options.getString('lang') ?? 'vi';
  logger.info(`[disclaimer]: Received type: ${type}, language: ${lang}`);

  const content = DISCLAIMERS[type][lang as keyof DisclaimerMap] ?? DISCLAIMERS.general.vi;

  const embedMessage = new EmbedBuilder({
    author: {
      name: 'VAIT',
    },
    description: content,
  });
  await interaction.reply({ embeds: [embedMessage] });
};

const command: SlashCommand = {
  data,
  execute: getDisclaimer,
};

export default command;
