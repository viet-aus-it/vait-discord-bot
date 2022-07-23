import 'dotenv/config';
import 'dotenv-expand/config';
import { InteractionType } from 'discord-api-types/v10';
import { processMessage } from './utils';
import { getDiscordClient } from './clients';
import { getConfigs } from './config';
import { commandList } from './commands';
import { deployGlobalCommands } from './commands/command';

const main = async () => {
  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  if (!client.user) throw new Error('Something went wrong!');
  console.log(`Logged in as ${client.user.tag}!`);

  if (process.env.NODE_ENV === 'production') {
    // This should only be run once during the bot startup in production.
    // For development usage, please use `pnpm deploy:command`
    await deployGlobalCommands(commandList, {
      token,
      clientId: client.user.id,
    });
  }

  const configs = getConfigs();
  client.on('messageCreate', (msg) => {
    return processMessage(msg, configs);
  });

  client.on('interactionCreate', async (interaction) => {
    const isCommand = interaction.isChatInputCommand();
    if (isCommand) {
      const { commandName } = interaction;
      const command = commandList.find((cmd) => cmd.data.name === commandName);
      return command?.execute(interaction);
    }

    const isAutocomplete =
      interaction.type === InteractionType.ApplicationCommandAutocomplete;
    if (isAutocomplete) {
      const { commandName } = interaction;
      const command = commandList.find((cmd) => cmd.data.name === commandName);
      return command?.autocomplete?.(interaction);
    }
  });
};

main();
process.on('SIGTERM', () => process.exit());
