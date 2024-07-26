import type { Message } from 'discord.js';
import { ROOT_CONTEXT, SpanStatusCode, context, trace } from '@opentelemetry/api';
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
  const tracer = trace.getTracer('discord-bot');
  const span = tracer.startSpan('main');

  span.setAttributes({
    'app.function': 'deployCommands',
    'app.bot.clientId': clientId,
    'app.bot.environment': process.env.NODE_ENV,
  });

  if (process.env.NODE_ENV !== 'production') {
    // This should only be run once during the bot startup in production.
    // For development usage, please use `pnpm deploy:command`
    logger.info('[deploy-commands]: Skipping command deployment in development mode');
    span.setStatus({
      code: SpanStatusCode.OK,
      message: 'Skipping command deployment in development mode',
    });
    span.end();

    return;
  }

  logger.info('[deploy-commands]: Deploying global commands in production mode');
  span.setStatus({
    code: SpanStatusCode.UNSET,
    message: 'Deploying global commands in production mode',
  });

  const commands = [...slashCommandList, ...contextMenuCommandList];
  const op = await Result.safe(deployGlobalCommands(commands, { token, clientId }));
  if (op.isErr()) {
    logger.error('[deploy-commands]: Cannot deploy global commands', op.unwrapErr());
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: 'Cannot deploy global commands',
    });
    span.setAttributes({
      'app.bot.error': op.unwrapErr().message,
    });
    span.end();

    process.exit(1);
  }

  logger.info('[deploy-commands]: Successfully deployed global commands');
  span.setStatus({
    code: SpanStatusCode.OK,
    message: 'Successfully deployed global commands',
  });
};

const main = async () => {
  loadEnv();
  setupTracer();
  const tracer = trace.getTracer('discord-bot');
  const span = tracer.startSpan('main', { root: true });

  span.setAttributes({
    'app.function': 'main',
  });

  logger.info('[main]: STARTING BOT');
  span.setStatus({
    code: SpanStatusCode.UNSET,
    message: 'Starting bot',
  });

  const token = process.env.TOKEN;
  const client = await getDiscordClient({ token });

  if (!client.user) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: 'Cannot login to Discord',
    });
    span.end();
    throw new Error('Cannot login to Discord');
  }
  logger.info(`[main]: Logged in as ${client.user.tag}!`);
  span.setStatus({
    code: SpanStatusCode.OK,
    message: 'Logged in to Discord',
  });
  span.setAttributes({
    'app.bot.userTag': client.user.tag,
  });

  await deployCommands({ token, clientId: client.user.id });

  const configs = getConfigs();
  client.on('messageCreate', (msg) => {
    return processMessage(msg as Message<true>, configs);
  });

  client.on('interactionCreate', async (interaction) => {
    return processInteraction(interaction);
  });

  span.end();
};

main();
process.on('SIGTERM', () => process.exit());
