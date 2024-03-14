import { type ChatInputCommandInteraction, type GuildMember, SlashCommandBuilder, type ThreadChannel } from 'discord.js';
import { isAdmin, isModerator } from '../../utils';
import { logger } from '../../utils/logger';
import type { Command } from '../builder';

const data = new SlashCommandBuilder()
  .setName('removeuserbyrole')
  .setDescription('Remove all users with a specific role from thread')
  .addRoleOption((option) => option.setName('name').setDescription('Tag a role to remove the list of matching users').setRequired(true));

export const removeUserByRole = async (interaction: ChatInputCommandInteraction) => {
  const guildMember = interaction.member as GuildMember;
  if (!isAdmin(guildMember) && !isModerator(guildMember)) {
    logger.info(`[remove-user-by-role]: ${guildMember.user.tag} doesn't have enough permission to run this command.`);
    await interaction.reply("You don't have enough permission to run this command.");
    return;
  }

  const channel = interaction.channel as ThreadChannel;
  if (!channel?.isThread()) {
    logger.info(`[remove-user-by-role]: ${guildMember.user.tag} tried to remove all users with role from entire channel.`);
    await interaction.reply("You can't remove all users from entire channel. This command only works in a thread.");
    return;
  }

  logger.info(`[remove-user-by-role]: ${guildMember.user.tag} is removing all users with role from thread ${channel.id}.`);
  await interaction.deferReply({ ephemeral: true });
  const role = interaction.options.getRole('name', true);
  const members = await channel.members.fetch({ withMember: true });
  const memberList = members.filter((user) => user.guildMember?.roles.cache.some((r) => r.id === role.id));
  const removeMemberPromises = memberList.map((user) => channel.members.remove(user.id));

  await Promise.all(removeMemberPromises);
  logger.info(`[remove-user-by-role]: Removed ${memberList.size} users from thread ${channel.id}.`);
  await interaction.editReply('Done');
};

const command: Command = {
  data,
  execute: removeUserByRole,
};

export default command;
