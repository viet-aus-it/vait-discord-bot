import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  GuildMember,
  ThreadChannel,
} from 'discord.js';
import { Command } from '../builder';
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
  const guildMember = interaction.member as GuildMember;
  if (!isAdmin(guildMember) && !isModerator(guildMember)) {
    await interaction.reply(
      "You don't have enough permission to run this command."
    );
    return;
  }

  const channel = interaction.channel as ThreadChannel;
  if (!channel?.isThread) {
    await interaction.reply(
      "You can't remove all users with role from entire channel. This command only works in a thread."
    );
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  const role = interaction.options.getRole('name', true);
  const members = await channel.members.fetch({ withMember: true });
  const memberList = members.filter((user) =>
    user.guildMember?.roles.cache.some((r) => r.id === role.id)
  );
  const removeMemberPromises = memberList.map((user) =>
    channel.members.remove(user.id)
  );

  await Promise.all(removeMemberPromises);
  await interaction.editReply('Done');
};

const command: Command = {
  data,
  execute: removeUserByRole,
};

export default command;
