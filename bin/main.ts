import { performance } from 'node:perf_hooks';
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
import { recordSpanError, tracer } from '../src/utils/tracer';

const deployCommands = async ({ token, clientId }: Omit<DiscordRequestConfig, 'guildId'>) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('[deploy-commands]: Skipping command deployment in development mode');
    return;
  }

  return tracer.startActiveSpan('deployCommands', async (span) => {
    const start = performance.now();

    try {
      logger.info('[deploy-commands]: Deploying global commands in production mode');
      const commands = [...slashCommandList, ...contextMenuCommandList];
      const op = await Result.safe(deployGlobalCommands(commands, { token, clientId }));
      if (op.isErr()) {
        recordSpanError(span, op.unwrapErr(), 'err-deploy-commands-failed');
        logger.error('[deploy-commands]: Cannot deploy global commands', { error: op.unwrapErr() });
        span.end();
        process.exit(1);
      }

      span.setAttribute('app.job.duration_ms', performance.now() - start);
      logger.info('[deploy-commands]: Successfully deployed global commands');
    } finally {
      span.end();
    }
  });
};

const main = async () => {
  loadEnv();
  logger.info('[main]: STARTING BOT');

  const token = process.env.TOKEN;
  const client = await getDiscordClient({ token });

  if (!client.user) throw new Error('Something went wrong!');
  logger.info(`[main]: Logged in as ${client.user.tag}!`);

  await deployCommands({ token, clientId: client.user.id });

  const honeypotOp = await Result.safe(loadHoneypotChannels());
  if (honeypotOp.isErr()) {
    logger.error('[honeypot]: Failed to load honeypot channels', { error: honeypotOp.unwrapErr() });
  }
  const configs = getConfigs();
  client.on(Events.MessageCreate, (msg) => processMessage(msg as Message<true>, configs));
  client.on(Events.InteractionCreate, (interaction) => processInteraction(interaction));
};

main();
process.on('SIGTERM', () => process.exit());
