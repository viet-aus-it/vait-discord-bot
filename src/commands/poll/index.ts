import { ChatInputCommandInteraction, EmbedBuilder, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../builder';

export const NUMBER_AS_STRING = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

const REACTION_NUMBERS = [
  '\u0031\u20E3',
  '\u0032\u20E3',
  '\u0033\u20E3',
  '\u0034\u20E3',
  '\u0035\u20E3',
  '\u0036\u20E3',
  '\u0037\u20E3',
  '\u0038\u20E3',
  '\u0039\u20E3',
];

const getData = () => {
  const data = new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption((option) => option.setName('question').setDescription('The question to create a poll for').setRequired(true));
  NUMBER_AS_STRING.forEach((value, index) => {
    data.addStringOption((option) =>
      option
        .setName(`option${index + 1}`)
        .setDescription(`option ${value}`)
        .setRequired(index < 2)
    );
  });

  return data;
};

const createEmbeddedMessage = (question: string, pollOptions: string[]) => {
  const message = pollOptions.reduce((accumulator, option, index) => {
    return `${accumulator}:${NUMBER_AS_STRING[index]}: ${option}\n\n`;
  }, '');

  return new EmbedBuilder({
    color: 0x0072a8,
    title: question.replace(/"/gim, ''),
    footer: { text: 'Poll created' },
    fields: [{ name: message, value: '\u200B' }],
    timestamp: Date.now(),
  });
};

export const createPoll = async (interaction: ChatInputCommandInteraction) => {
  const question = interaction.options.getString('question', true);
  const pollOptions = NUMBER_AS_STRING.reduce<string[]>((accum, _value, index) => {
    const option: string | null = interaction.options.getString(`option${index + 1}`, index < 2);

    if (!option) {
      return accum;
    }

    accum.push(option);
    return accum;
  }, []);

  const embed = createEmbeddedMessage(question, pollOptions);

  const pollMsg = await interaction.reply({
    embeds: [embed],
    fetchReply: true,
  });

  const promises = pollOptions.map((_value, index) => pollMsg.react(REACTION_NUMBERS[index]));
  await Promise.all(promises);
};

const command: Command = {
  data: getData(),
  execute: createPoll,
};

export default command;
