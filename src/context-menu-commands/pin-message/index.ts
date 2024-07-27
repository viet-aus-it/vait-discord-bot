import { SpanStatusCode, trace } from '@opentelemetry/api';
import { ApplicationCommandType, ContextMenuCommandBuilder, type ContextMenuCommandInteraction } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { ContextMenuCommand } from '../builder';

export const data = new ContextMenuCommandBuilder().setName('Pin').setType(ApplicationCommandType.Message);

export const pinMessage = async (interaction: ContextMenuCommandInteraction) => {
  const tracer = trace.getTracer('discord-bot');
  const span = tracer.startSpan('pinMessage');

  span.setAttributes({
    'app.interaction.type': 'context-menu-command',
    'app.command': 'pin',
  });

  if (!interaction.isMessageContextMenuCommand()) {
    logger.error('[pin]: Interaction is not a message context menu command.');
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: 'Interaction is not a message context menu command.',
    });
    span.end();

    return;
  }

  const message = interaction.targetMessage;
  logger.info(`[pin]: Pinning message ${message.id} in channel ${message.channelId}`);
  span.setStatus({
    code: SpanStatusCode.UNSET,
    message: 'Pinning message',
  });
  span.setAttributes({
    'app.pin.messageId': message.id,
    'app.pin.channelId': message.channelId,
    'app.pin.status': 'pinning',
  });

  if (message.pinned) {
    logger.info(`[pin]: Message ${message.id} is already pinned.`);
    span.setStatus({
      code: SpanStatusCode.OK,
      message: 'Message is already pinned.',
    });
    span.setAttributes({
      'app.pin.status': 'already-pinned',
    });
    span.end();

    await interaction.reply('Message is already pinned. Skipping...');

    return;
  }

  const op = await Result.safe(message.pin());
  if (op.isErr()) {
    logger.error(`[pin]: Cannot pin message ${message.id} in channel ${message.channelId}`, op.unwrapErr());
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: 'Cannot pin message',
    });
    span.setAttributes({
      'app.pin.status': 'error',
      'app.pin.error': op.unwrapErr().message,
    });

    await interaction.reply('ERROR: Cannot pin message. Please try again later.');
    return;
  }

  logger.info(`[pin]: Successfully pinned message ${message.id} in channel ${message.channelId}`);
  span.setStatus({
    code: SpanStatusCode.OK,
    message: 'Message is now pinned.',
  });
  span.setAttributes({
    'app.pin.status': 'pinned',
  });

  await interaction.reply('Message is now pinned!');
};

const command: ContextMenuCommand = {
  data,
  execute: pinMessage,
};

export default command;
