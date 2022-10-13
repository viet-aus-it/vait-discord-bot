import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { getRandomRGBValues } from '../../utils';
import { Command } from '../command';
import { getRandomComic } from './fetchComic';

const data = new SlashCommandBuilder()
  .setName('xkcd')
  .setDescription('Get a random xkcd');

export const getXKCD = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const comicPayload = await getRandomComic();
  if (comicPayload.name === 'GetRandomComicFailed') {
    console.log(comicPayload.message);
    await interaction.editReply('Error getting comic');
    return;
  }

  const embed = new EmbedBuilder()
    .setImage(comicPayload.comic.img)
    .setTitle(comicPayload.comic.title)
    .setURL(comicPayload.comic.source)
    .setDescription(comicPayload.comic.alt)
    .setFooter({
      text: `https://xkcd.com • ${comicPayload.comic.date}`,
      iconURL:
        'https://cdn.discordapp.com/attachments/826236555294146563/1030015171151810601/919f27-2.png',
    })
    .setColor(getRandomRGBValues());

  await interaction.editReply({ embeds: [embed] });
};

const command: Command = {
  data,
  execute: getXKCD,
};

export default command;
