import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  GuildMember,
  ThreadChannel,
} from 'discord.js';
import { Command } from '../command';
import { isAdmin, isModerator } from '../../utils';

const data = new SlashCommandBuilder()
  .setName('removeuserbyrole')
  .setDescription('Remove all users with a specific role from thread')
  .addRoleOption((option) =>
    option
      .setName('name')
      .setDescription('Tag a role to remove the list of matching users')
      .setRequired(true)
  );

export const removeUserByRole = async (
  interaction: ChatInputCommandInteraction
) => {
  const channel = interaction.channel as ThreadChannel;
  if (!channel?.isThread) return;

  const guildMember = interaction.member as GuildMember;
  if (!isAdmin(guildMember) && !isModerator(guildMember)) {
    await interaction.reply(
      "You don't have enough permission to run this command."
    );
    return;
  }
  const role = interaction.options.getRole('name', true);
  const memberList = channel.members.cache.filter((user) =>
    user.guildMember?.roles.cache.some((r) => r.id === role.id)
  );
  console.log(memberList.size);
  memberList.map((user) => channel.members.remove(user.id));
  interaction.reply('Done');
};

const command: Command = {
  data,
  execute: removeUserByRole,
};

export default command;
