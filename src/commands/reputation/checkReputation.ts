import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { logger } from '../../utils/logger';
import { Subcommand } from '../builder';
import { getOrCreateUser } from './_helpers';

const data = new SlashCommandSubcommandBuilder().setName('check').setDescription('Check your current rep');

export const checkReputation = async (interaction: ChatInputCommandInteraction) => {
  const discordUser = interaction.member!.user;
  logger.info(`[reputation]: ${discordUser.username} is checking their reputation`);
  const user = await getOrCreateUser(discordUser.id);
  await interaction.reply(`<@${discordUser.id}>: ${user.reputation} Rep`);
};

const command: Subcommand = {
  data,
  execute: checkReputation,
};

export default command;
