import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { isAdmin, isModerator } from '../../utils';
import { getOrCreateUser, updateRep } from './_helpers';
import { Subcommand } from '../command';

const data = new SlashCommandSubcommandBuilder()
  .setName('set')
  .setDescription('ADMIN COMMAND. Set a rep number for a user')
  .addUserOption((option) =>
    option.setName('user').setDescription('A user to set rep').setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName('rep')
      .setDescription('The rep number to set for the user')
      .setRequired(true)
      .setMinValue(0)
  );

export const setReputation = async (
  interaction: ChatInputCommandInteraction
) => {
  const guildMember = interaction.member as GuildMember;
  if (!isAdmin(guildMember) && !isModerator(guildMember)) {
    await interaction.reply(
      "You don't have enough permission to run this command."
    );
    return;
  }

  const repNumber = interaction.options.getInteger('rep', true);
  const author = interaction.member!.user;
  const discordUser = interaction.options.getUser('user', true);
  const user = await getOrCreateUser(discordUser.id);
  const updatedUser = await updateRep({
    fromUserId: author.id,
    toUserId: user.id,
    adjustment: { reputation: { set: repNumber } },
  });

  await interaction.reply(
    `<@${author.id}> just set <@${discordUser.id}>'s rep to ${repNumber}. \n<@${discordUser.id}>'s current rep: ${updatedUser.reputation}`
  );
};

const command: Subcommand = {
  data,
  execute: setReputation,
};

export default command;
