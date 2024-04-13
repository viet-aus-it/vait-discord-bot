import { type ChatInputCommandInteraction, type GuildMember, SlashCommandSubcommandBuilder } from 'discord.js';
import { logger } from '../../utils/logger';
import { isAdmin, isModerator } from '../../utils/permission';
import type { Subcommand } from '../builder';
import { getOrCreateUser, updateRep } from './utils';

const data = new SlashCommandSubcommandBuilder()
  .setName('take')
  .setDescription('ADMIN COMMAND. Take a rep from a user')
  .addUserOption((option) => option.setName('user').setDescription('A user to take rep from').setRequired(true));

export const takeReputation = async (interaction: ChatInputCommandInteraction) => {
  const guildMember = interaction.member as GuildMember;
  if (!isAdmin(guildMember) && !isModerator(guildMember)) {
    logger.info(`[take-reputation]: ${guildMember.user.tag} doesn't have enough permission to run this command.`);
    await interaction.reply("You don't have enough permission to run this command.");
    return;
  }

  const author = interaction.member!.user;
  const authorUser = await getOrCreateUser(author.id);
  const discordUser = interaction.options.getUser('user', true);
  logger.info(`[take-reputation]: ${guildMember.user.tag} is taking 1 rep from ${discordUser.tag}`);

  const user = await getOrCreateUser(discordUser.id);
  if (user.reputation === 0) {
    await interaction.reply(`<@${discordUser.id}> currently has 0 rep`);
    return;
  }

  const updatedUser = await updateRep({
    fromUserId: authorUser.id,
    toUserId: user.id,
    adjustment: { reputation: { decrement: 1 } },
  });
  const taken = interaction.guild?.members.cache.get(discordUser.id);
  const taker = interaction.guild?.members.cache.get(author.id);

  await interaction.reply(`${taker?.displayName} took 1 rep from ${taken?.displayName}.\n${taken?.displayName} → ${updatedUser.reputation} reps`);
};

const command: Subcommand = {
  data,
  execute: takeReputation,
};

export default command;
