import { Result } from 'oxide.ts';
import { deployGlobalCommands } from '../commands/deploy-command';
import { getCurrentUnixTime } from '../utils/dateUtils';
import { loadEnv } from '../utils/loadEnv';
import { logger } from '../utils/logger';

const deploy = async () => {
  loadEnv();
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';

  logger.info(`[delete-global-commands]: Deleting global commands. Timestamp: ${getCurrentUnixTime()}.`);
  const op = await Result.safe(
    deployGlobalCommands([], [], {
      token,
      clientId,
    })
  );
  if (op.isOk()) {
    logger.info(`[delete-global-commands]: Global commands deleted successfully. Timestamp: ${getCurrentUnixTime()}.`);
    process.exit(0);
  }

  logger.error(`[delete-global-commands]: Cannot delete global commands. Timestamp: ${getCurrentUnixTime()}`, op.unwrapErr());
  process.exit(1);
};

deploy();
