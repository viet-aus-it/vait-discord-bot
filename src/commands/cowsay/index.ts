import {
  ChatInputCommandInteraction,
  TextChannel,
  SlashCommandBuilder,
} from 'discord.js';
import { say } from 'cowsay';
import { fetchLastMessageBeforeId, isBlank } from '../../utils';
import { Command } from '../command';

// Only 35 characters per line due to limitation in phone screen width
const WRAP_TEXT_LIMIT = 35;

const data = new SlashCommandBuilder()
  .setName('cowsay')
  .setDescription('Make a cow say your chat message')
  .addStringOption((option) =>
    option.setName('sentence').setDescription('What you want the cow to say')
  );

// Remove backtick in message in case of nesting cowsay
export const removeBacktick = (message: string) => {
  if (message.indexOf('`') !== -1) {
    return message.replaceAll('`', '');
  }

  return message;
};

// Wrap text in multiple lines in case of long text input
const wrapText = (input: string, width: number) => {
  const resultArray = [];
  const words = input.split(' ');
  let line = '';

  // Check each words
  words.forEach((word) => {
    if ((line + word).length <= width) {
      // Add a word if line length is within limit
      line += (line ? ' ' : '') + word;
    } else {
      // Register and skip to next line if too long
      resultArray.push(line);
      line = word;
    }
  });

  // Add any leftover line to next line.
  resultArray.push(line);

  return resultArray.join('\n');
};

const generateCowsayText = (message: string) => {
  let chatContent = removeBacktick(message);
  chatContent = wrapText(chatContent, WRAP_TEXT_LIMIT);

  const config = { text: chatContent };
  return say(config);
};

const sendCowsay = async (
  content: string,
  interaction: ChatInputCommandInteraction
) => {
  const reply = `\`\`\`${generateCowsayText(content)}\`\`\``;

  try {
    await interaction.reply(reply);
  } catch (error) {
    console.error('CANNOT SEND MESSAGE', error);
  }
};

export const cowsay = async (interaction: ChatInputCommandInteraction) => {
  let content = interaction.options.getString('sentence');

  if (content && !isBlank(content)) {
    await sendCowsay(content, interaction);
    return;
  }

  // If /cowsay is detected but content is blank, fetch the latest message in channel
  const fetchedMessage = await fetchLastMessageBeforeId(
    interaction.channel as TextChannel,
    interaction.id
  );

  // If it's still blank at this point, then exit
  if (!fetchedMessage || isBlank(fetchedMessage.content)) {
    await interaction.reply(
      'Cannot fetch latest message. Please try again later.'
    );
    return;
  }

  content = fetchedMessage.content;
  await sendCowsay(content, interaction);
};

const command: Command = {
  data,
  execute: cowsay,
};

export default command;
