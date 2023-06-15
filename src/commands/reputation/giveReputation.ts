import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { getOrCreateUser, updateRep } from './_helpers';
import { Subcommand } from '../builder';

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
  const mentionedUsers = mentions.users.filter((user) => !user.bot);
  if (mentionedUsers.size < 1) return;
  const giver = msg.guild?.members.cache.get(author.id);
  const message = await mentionedUsers.reduce(
    async (accumulator, discordUser) => {
      const isAuthor = discordUser.id === author.id;
      if (isAuthor) {
        await msg.reply('You cannot give rep to yourself');
        return accumulator;
      }
      const accu = await accumulator;
      const updatedUser = await plusRep(author.id, discordUser.id);
      const receiver = msg.guild?.members.cache.get(discordUser.id);
      const message = `${receiver?.displayName} → ${updatedUser.reputation} reps`;
      return `${accu}\n${message}`;
    },
    Promise.resolve(`${giver?.displayName} gave 1 rep to the following users:`)
  );

  await channel.send(message);
};

const data = new SlashCommandSubcommandBuilder()
  .setName('give')
  .setDescription('Give a rep to another user')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('A user to give rep to')
      .setRequired(true)
  );

export const giveRepSlashCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  const author = interaction.member!.user;
  const discordUser = interaction.options.getUser('user', true);
  const isAuthor = author.id === discordUser.id;
  if (isAuthor) {
    await interaction.reply('You cannot give rep to yourself');
    return;
  }

  const updatedUser = await plusRep(author.id, discordUser.id);
  await interaction.reply(
    `<@${author.id}> gave <@${discordUser.id}> 1 rep. \n<@${discordUser.id}>'s current rep: ${updatedUser.reputation}`
  );
};

const subcommand: Subcommand = {
  data,
  execute: giveRepSlashCommand,
};

export default subcommand;
