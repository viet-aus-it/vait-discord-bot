import { SpanStatusCode, trace } from '@opentelemetry/api';
import { type Interaction, InteractionType } from 'discord.js';
import { Result } from 'oxide.ts';
import { commands as contextMenuCommandList } from '../context-menu-commands';
import { commands as slashCommandList } from '../slash-commands';
import { logger } from './logger';

export const processInteraction = async (interaction: Interaction): Promise<void> => {
  const tracer = trace.getTracer('discord-bot');
  return tracer.startActiveSpan('process-interaction', async (span) => {
    span.setStatus({
      code: SpanStatusCode.UNSET,
      message: 'Processing interaction',
    });

    const isCommand = interaction.isChatInputCommand();
    if (isCommand) {
      const { commandName } = interaction;

      logger.info(`[process-interaction]: RECEIVED COMMAND. COMMAND: ${commandName}`);
      span.setStatus({
        code: SpanStatusCode.UNSET,
        message: 'Processing command',
      });
      span.setAttributes({
        'app.interaction.type': 'command',
        'app.command.name': commandName,
      });

      const command = slashCommandList.find((cmd) => cmd.data.name === commandName);
      if (!command) {
        logger.info(`[process-interaction]: COMMAND NOT FOUND: ${commandName}. Exiting...`);
        span.setStatus({
          code: SpanStatusCode.OK,
          message: 'Command not found',
        });
        span.end();

        return;
      }

      const op = await Result.safe(command.execute(interaction));
      if (op.isErr()) {
        logger.error(`[process-interaction]: ERROR HANDLING COMMAND: ${commandName}, ERROR: ${op.unwrapErr()}`);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'Error handling command',
        });
        span.setAttributes({
          'app.error': op.unwrapErr().toString(),
        });
        span.end();

        return;
      }

      logger.info(`[process-interaction]: COMMAND HANDLED SUCCESSFULLY: ${commandName}`);
      span.setStatus({
        code: SpanStatusCode.OK,
        message: 'Command handled successfully',
      });
      span.end();

      return;
    }

    const isContextMenuCommand = interaction.isContextMenuCommand();
    if (isContextMenuCommand) {
      const { commandName } = interaction;

      logger.info(`[process-interaction]: RECEIVED CONTEXT MENU COMMAND. COMMAND: ${commandName}`);
      span.setStatus({
        code: SpanStatusCode.UNSET,
        message: 'Processing context menu command',
      });
      span.setAttributes({
        'app.interaction.type': 'context-menu-command',
        'app.command.name': commandName,
      });

      const command = contextMenuCommandList.find((cmd) => cmd.data.name === commandName);
      if (!command) {
        logger.info(`[process-interaction]: CONTEXT MENU COMMAND NOT FOUND: ${commandName}. Exiting...`);
        span.setStatus({
          code: SpanStatusCode.OK,
          message: 'Context menu command not found',
        });
        span.end();

        return;
      }

      const op = await Result.safe(command.execute(interaction));
      if (op.isErr()) {
        logger.error(`[process-interaction]: ERROR HANDLING CONTEXT MENU COMMAND: ${commandName}, ERROR: ${op.unwrapErr()}`);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'Error handling context menu command',
        });
        span.setAttributes({
          'app.error': op.unwrapErr().toString(),
        });
        span.end();

        return;
      }

      logger.info(`[process-interaction]: CONTEXT MENU COMMAND HANDLED SUCCESSFULLY: ${commandName}`);
      span.setStatus({
        code: SpanStatusCode.OK,
        message: 'Context menu command handled successfully',
      });
      span.end();

      return;
    }

    const isAutocomplete = interaction.type === InteractionType.ApplicationCommandAutocomplete;
    if (isAutocomplete) {
      const { commandName } = interaction;

      logger.info(`[process-interaction]: RECEIVED AUTOCOMPLETE. COMMAND: ${commandName}`);
      span.setStatus({
        code: SpanStatusCode.UNSET,
        message: 'Processing autocomplete',
      });
      span.setAttributes({
        'app.interaction.type': 'autocomplete',
        'app.command.name': commandName,
      });

      const command = slashCommandList.find((cmd) => cmd.data.name === commandName);
      if (!command || !command.autocomplete) {
        logger.info(`[process-interaction]: COMMAND AUTOCOMPLETE NOT FOUND: ${commandName}. Exiting...`);
        span.setStatus({
          code: SpanStatusCode.OK,
          message: 'Command autocomplete not found',
        });

        return;
      }

      const op = await Result.safe(command.autocomplete(interaction));
      if (op.isErr()) {
        logger.error(`[process-interaction]: ERROR HANDLING AUTOCOMPLETE: ${commandName}, ERROR: ${op.unwrapErr()}`);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'Error handling autocomplete',
        });
        span.setAttributes({
          'app.error': op.unwrapErr().toString(),
        });
        span.end();

        return;
      }

      logger.info(`[process-interaction]: AUTOCOMPLETE HANDLED SUCCESSFULLY: ${commandName}`);
      span.setStatus({
        code: SpanStatusCode.OK,
        message: 'Autocomplete handled successfully',
      });
      span.end();

      return;
    }

    logger.info(`[process-interaction]: INTERACTION TYPE NOT RECOGNIZED. TYPE: ${interaction.type}`);
    span.setStatus({
      code: SpanStatusCode.UNSET,
      message: 'Interaction type not recognized',
    });
    span.end();
  });
};
