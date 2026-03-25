import { type ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { logger } from '../../utils/logger';
import { tracer } from '../../utils/tracer';
import type { Subcommand } from '../builder';
import { getOrCreateUser } from './utils';

const data = new SlashCommandSubcommandBuilder().setName('check').setDescription('Check your current rep');

export const checkReputation = async (interaction: ChatInputCommandInteraction) => {
  return tracer.startActiveSpan('command.rep.check', async (span) => {
    try {
      const discordUser = interaction.member!.user;
      logger.info(`[reputation]: ${discordUser.username} is checking their reputation`);
      const user = await getOrCreateUser(discordUser.id);
      await interaction.reply(`<@${discordUser.id}>: ${user.reputation} Rep`);
    } finally {
      span.end();
    }
  });
};

const command: Subcommand = {
  data,
  execute: checkReputation,
};

export default command;
