import { type ChatInputCommandInteraction, type Message, SlashCommandSubcommandBuilder } from 'discord.js';
import { logger } from '../../utils/logger';
import type { Subcommand } from '../builder';
import { getOrCreateUser, updateRep } from './utils';

const plusRep = async (fromUserId: string, toUserId: string) => {
  const author = await getOrCreateUser(fromUserId);
  const user = await getOrCreateUser(toUserId);
  return updateRep({
    fromUserId: author.id,
    toUserId: user.id,
    adjustment: { reputation: { increment: 1 } },
  });
};

export const thankUserInMessage = async (msg: Message) => {
  const { author, channel, mentions } = msg;
  if (author.bot) return; // return if author is a Discord bot

  // Filter out bot users
  const mentionedUsers = mentions.users.filter((user) => !user.bot && user.id !== author.id);
  if (mentionedUsers.size < 1) return;

  const giver = msg.guild?.members.cache.get(author.id);
  const message = await mentionedUsers.reduce(
    async (accumulator, discordUser) => {
      const isAuthor = discordUser.id === author.id;
      if (isAuthor) {
        await msg.reply('You cannot give rep to yourself');
        return accumulator;
      }

      const previous = await accumulator;
      const updatedUser = await plusRep(author.id, discordUser.id);
      const receiver = msg.guild?.members.cache.get(discordUser.id);
      const message = `${receiver?.displayName} → ${updatedUser.reputation} reps`;
      return `${previous}\n${message}`;
    },
    Promise.resolve(`${giver?.displayName} gave 1 rep to the following users:`)
  );

  logger.info(`[thank-user-in-message]: ${message}`);
  await channel.send(message);
};

const data = new SlashCommandSubcommandBuilder()
  .setName('give')
  .setDescription('Give a rep to another user')
  .addUserOption((option) => option.setName('user').setDescription('A user to give rep to').setRequired(true));

export const giveRepSlashCommand = async (interaction: ChatInputCommandInteraction) => {
  const author = interaction.member!.user;
  const discordUser = interaction.options.getUser('user', true);

  const isAuthor = author.id === discordUser.id;
  if (isAuthor || discordUser.bot) {
    await interaction.reply('You cannot give rep to a bot or yourself');
    return;
  }

  const updatedUser = await plusRep(author.id, discordUser.id);
  const receiver = interaction.guild?.members.cache.get(discordUser.id);
  const giver = interaction.guild?.members.cache.get(author.id);
  const message = `${giver?.displayName} gave 1 rep to ${receiver?.displayName}.\n${receiver?.displayName} → ${updatedUser.reputation} reps`;
  logger.info(`[give-rep-slash-cmd]: ${message}`);
  await interaction.reply(message);
};

const subcommand: Subcommand = {
  data,
  execute: giveRepSlashCommand,
};

export default subcommand;
