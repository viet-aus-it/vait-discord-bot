import { Result } from 'oxide.ts';
import { getDiscordClient } from '../src/clients';
import { getConfigs } from '../src/config';
import { commands as contextMenuCommandList } from '../src/context-menu-commands';
import { deployGlobalCommands } from '../src/deploy-command';
import { commands as slashCommandList } from '../src/slash-commands';
import { processInteraction } from '../src/utils/interaction-processor';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { processMessage } from '../src/utils/message-processor';

const main = async () => {
  loadEnv();
  logger.info('[main]: STARTING BOT');
  const token = process.env.TOKEN;
  const client = await getDiscordClient({ token });

  if (!client.user) throw new Error('Something went wrong!');
  logger.info(`[main]: Logged in as ${client.user.tag}!`);

  if (process.env.NODE_ENV === 'production') {
    // This should only be run once during the bot startup in production.
    // For development usage, please use `pnpm deploy:command`
    logger.info('[main]: Deploying global commands');
    const commands = [...slashCommandList, ...contextMenuCommandList];
    const op = await Result.safe(
      deployGlobalCommands(commands, {
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
    return processInteraction(interaction);
  });
};

main();
process.on('SIGTERM', () => process.exit());
