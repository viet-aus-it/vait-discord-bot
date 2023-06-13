import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { getOrCreateUser } from './_helpers';
import { Subcommand } from '../builder';

const data = new SlashCommandSubcommandBuilder()
  .setName('check')
  .setDescription('Check your current rep');

export const checkReputation = async (
  interaction: ChatInputCommandInteraction
) => {
  const discordUser = interaction.member!.user;
  const user = await getOrCreateUser(discordUser.id);
  await interaction.reply(`<@${discordUser.id}>: ${user.reputation} Rep`);
};

const command: Subcommand = {
  data,
  execute: checkReputation,
};

export default command;
