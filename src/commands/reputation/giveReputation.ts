import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { getOrCreateUser, updateRep } from './_helpers.js';
import { Subcommand } from '../command.js';

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

  const promises = mentionedUsers.map(async (discordUser) => {
    const isAuthor = discordUser.id === author.id;
    if (isAuthor) {
      return msg.reply('You cannot give rep to yourself');
    }

    const updatedUser = await plusRep(author.id, discordUser.id);

    return channel.send(
      `<@${author.id}> gave <@${discordUser.id}> 1 rep. \n<@${discordUser.id}>'s current rep: ${updatedUser.reputation}`
    );
  });

  return Promise.allSettled(promises);
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
