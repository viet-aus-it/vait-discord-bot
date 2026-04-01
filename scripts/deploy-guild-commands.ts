import { Result } from 'oxide.ts';

import { commands as contextMenuCommandList } from '../src/context-menu-commands';
import { deployGuildCommands } from '../src/deploy-command';
import { commands as slashCommandList } from '../src/slash-commands';
import { getCurrentUnixTime } from '../src/utils/date';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';

const deploy = async () => {
  const env = loadEnv();

  if (!env.GUILD_ID) {
    throw new Error('GUILD_ID is not provided');
  }

  logger.info('[deploy-guild-commands]: Deploying guild commands');
  const commands = [...slashCommandList, ...contextMenuCommandList];
  const op = await Result.safe(
    deployGuildCommands(commands, {
      token: env.TOKEN,
      clientId: env.CLIENT_ID,
      guildId: env.GUILD_ID,
    })
  );
  if (op.isOk()) {
    logger.info('[deploy-guild-commands]: Guild commands deployed successfully');
    process.exit(0);
  }

  logger.error(`[deploy-guild-commands]: Cannot deploy guild commands.`, op.unwrapErr());
  process.exit(1);
};

deploy();
