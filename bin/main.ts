import { Events, type Message } from 'discord.js';
import { Result } from 'oxide.ts';
import { getDiscordClient } from '../src/clients';
import { getConfigs } from '../src/config';
import { commands as contextMenuCommandList } from '../src/context-menu-commands';
import { type DiscordRequestConfig, deployGlobalCommands } from '../src/deploy-command';
import { commands as slashCommandList } from '../src/slash-commands';
import { loadHoneypotChannels } from '../src/utils/honeypot-handler';
import { processInteraction } from '../src/utils/interaction-processor';
import { type ConfigSchema, loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { processMessage } from '../src/utils/message-processor';
import { recordSpanError, setSpanAttributes, tracer } from '../src/utils/tracer';

const handleDeployCommands = async ({ token, clientId }: Omit<DiscordRequestConfig, 'guildId'>) => {
  logger.info('[deploy-commands]: Deploying global commands in production mode');
  const commands = [...slashCommandList, ...contextMenuCommandList];
  const op = await Result.safe(deployGlobalCommands(commands, { token, clientId }));
  if (op.isErr()) {
    recordSpanError(op.unwrapErr(), 'err-deploy-commands-failed');
    logger.error('[deploy-commands]: Cannot deploy global commands', op.unwrapErr());
    return 1;
  }

  logger.info('[deploy-commands]: Successfully deployed global commands');
  return 0;
};

const deployCommands = async ({ token, clientId, nodeEnv }: Omit<DiscordRequestConfig, 'guildId'> & { nodeEnv: ConfigSchema['NODE_ENV'] }) => {
  if (nodeEnv !== 'production') {
    logger.info('[deploy-commands]: Skipping command deployment in development mode');
    return;
  }

  const result = await tracer.startActiveSpan('deployCommands', async (span) => {
    const op = await Result.safe(handleDeployCommands({ token, clientId }));
    span.end();
    return op;
  });

  if (result.isOk() && result.unwrap() === 1) process.exit(1);
  if (result.isErr()) process.exit(1);
};

const handleLoadHoneypots = async () => {
  const op = await Result.safe(loadHoneypotChannels());
  if (op.isErr()) {
    recordSpanError(op.unwrapErr(), 'err-load-honeypots-failed');
    logger.error('[honeypot]: Failed to load honeypot channels', op.unwrapErr());
    return;
  }
  setSpanAttributes({ 'bot.honeypot.channel_count': op.unwrap() });
};

const loadHoneypots = async () => {
  return tracer.startActiveSpan('loadHoneypots', async (span) => {
    await Result.safe(handleLoadHoneypots());
    span.end();
  });
};

const main = async () => {
  const env = loadEnv();
  logger.info('[main]: STARTING BOT');

  const client = await getDiscordClient({ token: env.TOKEN });

  if (!client.user) throw new Error('Something went wrong!');
  logger.info(`[main]: Logged in as ${client.user.tag}!`);

  await deployCommands({ token: env.TOKEN, clientId: client.user.id, nodeEnv: env.NODE_ENV });

  await loadHoneypots();

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
