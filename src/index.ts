import { InteractionType } from 'discord-api-types/v10';
import { getUnixTime } from 'date-fns';
import { Result } from 'oxide.ts';
import { processMessage } from './utils';
import { getDiscordClient } from './clients';
import { getConfigs } from './config';
import { commandList, contextMenuCommandList } from './commands';
import { deployGlobalCommands } from './commands/deploy-command';
import { loadEnv } from './utils/loadEnv';

const main = async () => {
  loadEnv();
  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  if (!client.user) throw new Error('Something went wrong!');
  console.log(`Logged in as ${client.user.tag}!`);

  if (process.env.NODE_ENV === 'production') {
    // This should only be run once during the bot startup in production.
    // For development usage, please use `pnpm deploy:command`
    const op = await Result.safe(
      deployGlobalCommands(commandList, contextMenuCommandList, {
        token,
        clientId: client.user.id,
      })
    );
    if (op.isErr()) {
      console.error('Cannot deploy commands', op.unwrapErr());
      process.exit(1);
    }
  }

  const configs = getConfigs();
  client.on('messageCreate', (msg) => {
    return processMessage(msg, configs);
  });

  client.on('interactionCreate', async (interaction) => {
    try {
      const isCommand = interaction.isChatInputCommand();
      const isContextMenuCommand = interaction.isContextMenuCommand();
      if (isCommand) {
        const { commandName } = interaction;
        const command = commandList.find(
          (cmd) => cmd.data.name === commandName
        );
        return await command?.execute(interaction);
      }

      if (isContextMenuCommand) {
        const { commandName } = interaction;
        const command = contextMenuCommandList.find(
          (cmd) => cmd.data.name === commandName
        );
        return await command?.execute(interaction);
      }

      const isAutocomplete =
        interaction.type === InteractionType.ApplicationCommandAutocomplete;
      if (isAutocomplete) {
        const { commandName } = interaction;
        const command = commandList.find(
          (cmd) => cmd.data.name === commandName
        );
        return await command?.autocomplete?.(interaction);
      }
    } catch (error) {
      // TODO: More error handling here and/or forward this to a tracker service
      const currentTimestamp = getUnixTime(Date.now());
      console.error(
        `ERROR HANDLING INTERACTION. TIMESTAMP: ${currentTimestamp}, ERROR: ${error}.`
      );
    }
  });
};

main();
process.on('SIGTERM', () => process.exit());
