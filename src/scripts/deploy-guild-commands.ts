import { Result } from 'oxide.ts';
import { commandList, contextMenuCommandList } from '../commands';
import { deployGuildCommands } from '../commands/deploy-command';
import { getCurrentUnixTime } from '../utils/date-utils';
import { loadEnv } from '../utils/load-env';
import { logger } from '../utils/logger';

const deploy = async () => {
  loadEnv();
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';
  const guildId = process.env.GUILD_ID ?? '';

  logger.info('[deploy-guild-commands]: Deploying guild commands');
  const op = await Result.safe(
    deployGuildCommands(commandList, contextMenuCommandList, {
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
