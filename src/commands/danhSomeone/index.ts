import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getRandomBoolean, getRandomIntInclusive } from '../../utils';
import { logger } from '../../utils/logger';
import { Command } from '../builder';

const MAX_MENTIONS = 10;

const getData = () => {
  const data = new SlashCommandBuilder()
    .setName('hit')
    .setDescription('Hit up to 10 people. At least 1 user must be provided.')
    .addUserOption((option) => option.setName('target1').setDescription('target 1 to hit').setRequired(true));

  for (const num of [...Array(MAX_MENTIONS).keys()]) {
    data.addUserOption((option) => option.setName(`target${num + 2}`).setDescription(`target ${num + 2} to hit`));
  }

  return data;
};

export const danhSomeone = async (interaction: ChatInputCommandInteraction) => {
  const botId = interaction.client.user!.id;
  const author = interaction.member!.user;

  const messages = [...Array(MAX_MENTIONS).keys()]
    .map((num) => {
      const target = interaction.options.getUser(`target${num + 1}`, num === 0);
      if (!target) {
        return undefined;
      }

      if (target.id === botId) {
        logger.info(`[hit] ${author.id} hit bot.`);
        return `<@${author.id}>, I'm your father, you can't hit me.`;
      }

      if (target.id === author.id) {
        logger.info(`[hit] ${author.id} hit themself.`);
        return `Stop hitting yourself <@${author.id}>, hit someone else.`;
      }

      const dmg = getRandomIntInclusive(0, 100);
      const dmgText = `<@${target.id}> takes ${dmg} dmg.`;
      const critChance = getRandomBoolean();
      const critText = critChance ? ' Critical Hit!' : '';

      logger.info(`[hit] ${author.id} hit ${target.id} for ${dmg} dmg.`);
      return `${dmgText}${critText}`;
    })
    .filter((msg) => msg)
    .join('\n');

  await interaction.reply(messages);
};

const command: Command = {
  data: getData(),
  execute: danhSomeone,
};

export default command;
