import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { isAdmin, isModerator } from '../../utils';
import { getOrCreateUser, updateRep } from './_helpers';
import { Subcommand } from '../builder';

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
  const discordUser = interaction.options.getUser('user', true);

  const author = interaction.member!.user;
  const authorUser = await getOrCreateUser(author.id);
  const user = await getOrCreateUser(discordUser.id);
  const updatedUser = await updateRep({
    fromUserId: authorUser.id,
    toUserId: user.id,
    adjustment: { reputation: { set: repNumber } },
  });

  const receiver = interaction.guild?.members.cache.get(discordUser.id);
  const setter = interaction.guild?.members.cache.get(author.id);

  await interaction.reply(
    `${setter?.displayName} just set ${receiver?.displayName}'s rep to ${repNumber}.\n${receiver?.displayName} → ${updatedUser.reputation} reps`
  );
};

const command: Subcommand = {
  data,
  execute: setReputation,
};

export default command;
