import { type Interaction, InteractionType } from 'discord.js';
import { Result } from 'oxide.ts';
import { commands as contextMenuCommandList } from '../context-menu-commands';
import { commands as slashCommandList } from '../slash-commands';
import { logger } from './logger';
import { recordSpanError, tracer } from './tracer';

export const processInteraction = async (interaction: Interaction): Promise<void> => {
  return tracer.startActiveSpan('processInteraction', async (span) => {
    try {
      if (interaction.guildId) span.setAttribute('discord.guild.id', interaction.guildId);
      if (interaction.channelId) span.setAttribute('discord.channel.id', interaction.channelId);
      span.setAttribute('enduser.id', interaction.user.id);

      const isCommand = interaction.isChatInputCommand();
      if (isCommand) {
        const { commandName } = interaction;
        span.setAttribute('bot.command.name', commandName);
        span.setAttribute('discord.interaction.type', 'chatInputCommand');
        logger.info(`[process-interaction]: RECEIVED COMMAND. COMMAND: ${commandName}`);
        const command = slashCommandList.find((cmd) => cmd.data.name === commandName);
        if (!command) {
          logger.info(`[process-interaction]: COMMAND NOT FOUND: ${commandName}. Exiting...`);
          return;
        }

        const op = await Result.safe(command.execute(interaction));
        if (op.isErr()) {
          recordSpanError(op.unwrapErr(), `err-command-${commandName}-failed`);
          logger.error(`[process-interaction]: ERROR HANDLING COMMAND: ${commandName}`, op.unwrapErr());
          return;
        }

        logger.info(`[process-interaction]: COMMAND HANDLED SUCCESSFULLY: ${commandName}`);
        return;
      }

      const isContextMenuCommand = interaction.isContextMenuCommand();
      if (isContextMenuCommand) {
        const { commandName } = interaction;
        span.setAttribute('bot.command.name', commandName);
        span.setAttribute('discord.interaction.type', 'contextMenuCommand');
        logger.info(`[process-interaction]: RECEIVED CONTEXT MENU COMMAND. COMMAND: ${commandName}`);
        const command = contextMenuCommandList.find((cmd) => cmd.data.name === commandName);
        if (!command) {
          logger.info(`[process-interaction]: CONTEXT MENU COMMAND NOT FOUND: ${commandName}. Exiting...`);
          return;
        }

        const op = await Result.safe(command.execute(interaction));
        if (op.isErr()) {
          recordSpanError(op.unwrapErr(), `err-contextmenu-${commandName}-failed`);
          logger.error(`[process-interaction]: ERROR HANDLING CONTEXT MENU COMMAND: ${commandName}`, op.unwrapErr());
          return;
        }

        logger.info(`[process-interaction]: CONTEXT MENU COMMAND HANDLED SUCCESSFULLY: ${commandName}`);
        return;
      }

      const isAutocomplete = interaction.type === InteractionType.ApplicationCommandAutocomplete;
      if (isAutocomplete) {
        const { commandName } = interaction;
        span.setAttribute('bot.command.name', commandName);
        span.setAttribute('discord.interaction.type', 'autocomplete');
        logger.info(`[process-interaction]: RECEIVED AUTOCOMPLETE. COMMAND: ${commandName}`);
        const command = slashCommandList.find((cmd) => cmd.data.name === commandName);
        if (!command || !command.autocomplete) {
          logger.info(`[process-interaction]: COMMAND AUTOCOMPLETE NOT FOUND: ${commandName}. Exiting...`);
          return;
        }

        const op = await Result.safe(command.autocomplete(interaction));
        if (op.isErr()) {
          recordSpanError(op.unwrapErr(), `err-autocomplete-${commandName}-failed`);
          logger.error(`[process-interaction]: ERROR HANDLING AUTOCOMPLETE: ${commandName}`, op.unwrapErr());
          return;
        }

        logger.info(`[process-interaction]: AUTOCOMPLETE HANDLED SUCCESSFULLY: ${commandName}`);
        return;
      }

      logger.info(`[process-interaction]: INTERACTION TYPE NOT RECOGNIZED. TYPE: ${interaction.type}`);
    } finally {
      span.end();
    }
  });
};
