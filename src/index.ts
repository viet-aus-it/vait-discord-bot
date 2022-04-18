import 'dotenv/config';
import 'dotenv-expand/config';
import { processMessage } from './utils';
import { getDiscordClient } from './clients';
import { getConfigs } from './config';

const main = async () => {
  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  if (!client.user) throw new Error('Something went wrong!');
  console.log(`Logged in as ${client.user.tag}!`);

  const configs = getConfigs(client.user);
  client.on('messageCreate', (msg) => {
    if (msg.type === 'APPLICATION_COMMAND') return;

    return processMessage(msg, configs);
  });

  client.on('interactionCreate', async (interaction) => {
    const isCommand = interaction.isCommand();

    if (!isCommand) return;

    const { commandName } = interaction;
    console.log({ commandName });
    if (commandName === 'ping') {
      await interaction.reply('pong!');
    }
  });
};

main();
process.on('SIGTERM', () => process.exit());
