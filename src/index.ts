import { InteractionType } from 'discord-api-types/v10';
import { Result } from 'oxide.ts';
import { getDiscordClient } from './clients';
import { commandList, contextMenuCommandList } from './commands';
import { deployGlobalCommands } from './commands/deploy-command';
import { getConfigs } from './config';
import { loadEnv } from './utils/load-env';
import { logger } from './utils/logger';
import { processMessage } from './utils/message-processor';

const main = async () => {
  loadEnv();
  logger.info('[main]: STARTING BOT');
  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });

  if (!client.user) throw new Error('Something went wrong!');
  logger.info(`[main]: Logged in as ${client.user.tag}!`);

  if (process.env.NODE_ENV === 'production') {
    // This should only be run once during the bot startup in production.
    // For development usage, please use `pnpm deploy:command`
    logger.info('[main]: Deploying global commands');
    const op = await Result.safe(
      deployGlobalCommands(commandList, contextMenuCommandList, {
        token,
        clientId: client.user.id,
      })
    );
    if (op.isErr()) {
      logger.error('[main]: Cannot deploy global commands', op.unwrapErr());
      process.exit(1);
    }
    logger.info('[main]: Successfully deployed global commands');
  }

  const configs = getConfigs();
  client.on('messageCreate', (msg) => {
    return processMessage(msg, configs);
  });

  client.on('interactionCreate', async (interaction) => {
    try {
      const isCommand = interaction.isChatInputCommand();
      if (isCommand) {
        const { commandName } = interaction;
        logger.info(`[main]: RECEIVED COMMAND. COMMAND: ${commandName}`);
        const command = commandList.find((cmd) => cmd.data.name === commandName);
        return await command?.execute(interaction);
      }

      const isContextMenuCommand = interaction.isContextMenuCommand();
      if (isContextMenuCommand) {
        const { commandName } = interaction;
        logger.info(`[main]: RECEIVED CONTEXT MENU COMMAND. COMMAND: ${commandName}`);
        const command = contextMenuCommandList.find((cmd) => cmd.data.name === commandName);
        return await command?.execute(interaction);
      }

      const isAutocomplete = interaction.type === InteractionType.ApplicationCommandAutocomplete;
      if (isAutocomplete) {
        const { commandName } = interaction;
        logger.info(`[main]: RECEIVED AUTOCOMPLETE. COMMAND: ${commandName}`);
        const command = commandList.find((cmd) => cmd.data.name === commandName);
        return await command?.autocomplete?.(interaction);
      }
    } catch (error) {
      logger.error(`[main]: ERROR HANDLING INTERACTION, ERROR: ${error}`);
    }
  });
};

main();
process.on('SIGTERM', () => process.exit());
