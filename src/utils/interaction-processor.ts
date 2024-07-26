import { type Interaction, InteractionType } from 'discord.js';
import { Result } from 'oxide.ts';
import { commands as contextMenuCommandList } from '../context-menu-commands';
import { commands as slashCommandList } from '../slash-commands';
import { logger } from './logger';

export const processInteraction = async (interaction: Interaction): Promise<void> => {
  const isCommand = interaction.isChatInputCommand();
  if (isCommand) {
    const { commandName } = interaction;
    logger.info(`[process-interaction]: RECEIVED COMMAND. COMMAND: ${commandName}`);
    const command = slashCommandList.find((cmd) => cmd.data.name === commandName);
    if (!command) {
      logger.info(`[process-interaction]: COMMAND NOT FOUND: ${commandName}. Exiting...`);
      return;
    }

    const op = await Result.safe(command.execute(interaction));
    if (op.isErr()) {
      logger.error(`[process-interaction]: ERROR HANDLING COMMAND: ${commandName}, ERROR: ${op.unwrapErr()}`);
      return;
    }
  }

  const isContextMenuCommand = interaction.isContextMenuCommand();
  if (isContextMenuCommand) {
    const { commandName } = interaction;
    logger.info(`[process-interaction]: RECEIVED CONTEXT MENU COMMAND. COMMAND: ${commandName}`);
    const command = contextMenuCommandList.find((cmd) => cmd.data.name === commandName);
    if (!command) {
      logger.info(`[process-interaction]: CONTEXT MENU COMMAND NOT FOUND: ${commandName}. Exiting...`);
      return;
    }

    const op = await Result.safe(command.execute(interaction));
    if (op.isErr()) {
      logger.error(`[process-interaction]: ERROR HANDLING CONTEXT MENU COMMAND: ${commandName}, ERROR: ${op.unwrapErr()}`);
      return;
    }
  }

  const isAutocomplete = interaction.type === InteractionType.ApplicationCommandAutocomplete;
  if (isAutocomplete) {
    const { commandName } = interaction;
    logger.info(`[process-interaction]: RECEIVED AUTOCOMPLETE. COMMAND: ${commandName}`);
    const command = slashCommandList.find((cmd) => cmd.data.name === commandName);
    if (!command || !command.autocomplete) {
      logger.info(`[process-interaction]: COMMAND AUTOCOMPLETE NOT FOUND: ${commandName}. Exiting...`);
      return;
    }

    const op = await Result.safe(command.autocomplete(interaction));
    if (op.isErr()) {
      logger.error(`[process-interaction]: ERROR HANDLING AUTOCOMPLETE: ${commandName}, ERROR: ${op.unwrapErr()}`);
      return;
    }
    return await command?.autocomplete?.(interaction);
  }

  logger.info(`[process-interaction]: INTERACTION TYPE NOT RECOGNIZED. TYPE: ${interaction.type}`);
};
