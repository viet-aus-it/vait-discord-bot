import { Result } from 'oxide.ts';
import { commandList, contextMenuCommandList } from '../src/commands';
import { deployGuildCommands } from '../src/commands/deploy-command';
import { getCurrentUnixTime } from '../src/utils/date-utils';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';

const deploy = async () => {
  loadEnv();
  const token = process.env.TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!guildId) {
    throw new Error('GUILD_ID is not provided');
  }

  logger.info('[deploy-guild-commands]: Deploying guild commands');
  const op = await Result.safe(
    deployGuildCommands([...commandList, ...contextMenuCommandList,], {
      token,
      clientId,
      guildId,
    })
  );
  if (op.isOk()) {
    logger.info('[deploy-guild-commands]: Guild commands deployed successfully');
    process.exit(0);
  }

  logger.error(`[deploy-guild-commands]: Cannot deploy guild commands. Timestamp ${getCurrentUnixTime()}`, op.unwrapErr());
  process.exit(1);
};

deploy();
