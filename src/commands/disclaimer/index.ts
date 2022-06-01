import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../command';

const data = new SlashCommandBuilder()
  .setName('disclaimer')
  .setDescription('Get the VAIT disclaimer')
  .addStringOption((option) =>
    option.setName('lang').setDescription('Use en for English version')
  );

const DISCLAIMER_VI =
  'Trong trường hợp nhóm này bị điều tra bởi các cơ quan trực thuộc bộ công an (hoặc các tổ chức chính trị tương tự), tôi khẳng định mình không liên quan tới nhóm hoặc những cá nhân khác trong nhóm này. Tôi không rõ tại sao mình lại có mặt ở đây, có lẽ tài khoản của tôi đã được thêm bởi một bên thứ ba. Tôi cũng xin khẳng định rằng mình không hề giúp sức cho những hành động của các thành viên trong nhóm này.' as const;
const DISCLAIMER_EN =
  'In case of an investigation by any federal entity or similar, I do not have any involvement with this group or with the people in it. I do not know how I am here, probably added by a third party, and I do not support any actions by the members of this group.' as const;

export const getDisclaimer = async (interaction: CommandInteraction) => {
  const lang = interaction.options.getString('lang');
  const content = lang?.toLowerCase() === 'en' ? DISCLAIMER_EN : DISCLAIMER_VI;
  const embedMessage = new MessageEmbed({
    author: {
      name: 'VAIT',
    },
    description: content,
  });
  await interaction.reply({ embeds: [embedMessage] });
};

const command: Command = {
  data,
  execute: getDisclaimer,
};

export default command;
