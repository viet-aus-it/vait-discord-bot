import type { Message } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDiscordClient } from '../src/clients';
import { getConfigs } from '../src/config';
import { commands as contextMenuCommandList } from '../src/context-menu-commands';
import { type DiscordRequestConfig, deployGlobalCommands } from '../src/deploy-command';
import { commands as slashCommandList } from '../src/slash-commands';
import { processInteraction } from '../src/utils/interaction-processor';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { processMessage } from '../src/utils/message-processor';
import { setupTracer } from './tracing';

const deployCommands = async ({ token, clientId }: Omit<DiscordRequestConfig, 'guildId'>) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('[deploy-commands]: Skipping command deployment in development mode');
    return;
  }

  logger.info('[deploy-commands]: Deploying global commands in production mode');
  const commands = [...slashCommandList, ...contextMenuCommandList];
  const op = await Result.safe(deployGlobalCommands(commands, { token, clientId }));
  if (op.isErr()) {
    logger.error('[deploy-commands]: Cannot deploy global commands', op.unwrapErr());
    process.exit(1);
  }

  logger.info('[deploy-commands]: Successfully deployed global commands');
};

const main = async () => {
  loadEnv();
  setupTracer();
  logger.info('[main]: STARTING BOT');

  const token = process.env.TOKEN;
  const client = await getDiscordClient({ token });

  if (!client.user) throw new Error('Something went wrong!');
  logger.info(`[main]: Logged in as ${client.user.tag}!`);

  await deployCommands({ token, clientId: client.user.id });

  const configs = getConfigs();
  client.on('messageCreate', (msg) => {
    return processMessage(msg as Message<true>, configs);
  });

  client.on('interactionCreate', async (interaction) => {
    return processInteraction(interaction);
  });
};

main();
process.on('SIGTERM', () => process.exit());
