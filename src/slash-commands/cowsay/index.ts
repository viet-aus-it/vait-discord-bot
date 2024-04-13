import { say } from 'cowsay';
import { type ChatInputCommandInteraction, SlashCommandBuilder, type TextChannel } from 'discord.js';
import { Result } from 'oxide.ts';
import { isBlank } from '../../utils/is-blank';
import { logger } from '../../utils/logger';
import { fetchLastMessageBeforeId } from '../../utils/message-fetcher';
import type { SlashCommand } from '../builder';

// Only 35 characters per line due to limitation in phone screen width
const WRAP_TEXT_LIMIT = 35;

const data = new SlashCommandBuilder()
  .setName('cowsay')
  .setDescription('Make a cow say your chat message')
  .addStringOption((option) => option.setName('sentence').setDescription('What you want the cow to say'));

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
  for (const word of words) {
    if ((line + word).length <= width) {
      // Add a word if line length is within limit
      line += (line ? ' ' : '') + word;
    } else {
      // Register and skip to next line if too long
      resultArray.push(line);
      line = word;
    }
  }

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

export const cowsay = async (interaction: ChatInputCommandInteraction) => {
  const content = interaction.options.getString('sentence');

  if (content && !isBlank(content)) {
    logger.info(`[cowsay] Received message: [${content}]`);
    const reply = `\`\`\`${generateCowsayText(content)}\`\`\``;
    await interaction.reply(reply);
    return;
  }

  // If /cowsay is detected but content is blank, fetch the latest message in channel
  const fetchedMessage = await Result.safe(fetchLastMessageBeforeId(interaction.channel as TextChannel, interaction.id));

  // If it's still blank at this point, then exit
  if (fetchedMessage.isErr() || isBlank(fetchedMessage.unwrap().content)) {
    await interaction.reply('Cannot fetch latest message. Please try again later.');
    return;
  }

  logger.info(`[cowsay] Fetched message: [${fetchedMessage.unwrap().content}`);
  const cowText = generateCowsayText(fetchedMessage.unwrap().content);
  const reply = `\`\`\`${cowText}\`\`\``;
  await interaction.reply(reply);
};

const command: SlashCommand = {
  data,
  execute: cowsay,
};

export default command;
