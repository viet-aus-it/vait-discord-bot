import { Events, type Message } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDiscordClient } from '../src/clients';
import { getConfigs } from '../src/config';
import { commands as contextMenuCommandList } from '../src/context-menu-commands';
import { type DiscordRequestConfig, deployGlobalCommands } from '../src/deploy-command';
import { commands as slashCommandList } from '../src/slash-commands';
import { loadHoneypotChannels } from '../src/utils/honeypot-handler';
import { processInteraction } from '../src/utils/interaction-processor';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { processMessage } from '../src/utils/message-processor';

const deployCommands = async ({ token, clientId, nodeEnv }: Omit<DiscordRequestConfig, 'guildId'> & { nodeEnv: string }) => {
  if (nodeEnv !== 'production') {
    logger.info('[deploy-commands]: Skipping command deployment in development mode');
    return;
  }

  logger.info('[deploy-commands]: Deploying global commands in production mode');
  const commands = [...slashCommandList, ...contextMenuCommandList];
  const op = await Result.safe(deployGlobalCommands(commands, { token, clientId }));
  if (op.isErr()) {
    logger.error('[deploy-commands]: Cannot deploy global commands', { error: op.unwrapErr() });
    process.exit(1);
  }

  logger.info('[deploy-commands]: Successfully deployed global commands');
};

const main = async () => {
  const env = loadEnv();
  logger.info('[main]: STARTING BOT');

  const client = await getDiscordClient({ token: env.TOKEN });

  if (!client.user) throw new Error('Something went wrong!');
  logger.info(`[main]: Logged in as ${client.user.tag}!`);

  await deployCommands({ token: env.TOKEN, clientId: client.user.id, nodeEnv: env.NODE_ENV });

  const honeypotOp = await Result.safe(loadHoneypotChannels());
  if (honeypotOp.isErr()) {
    logger.error('[honeypot]: Failed to load honeypot channels', { error: honeypotOp.unwrapErr() });
  }
  const configs = getConfigs();
  client.on(Events.MessageCreate, (msg) => {
    return processMessage(msg as Message<true>, configs);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    return processInteraction(interaction);
  });
};

main();
process.on('SIGTERM', () => process.exit());
