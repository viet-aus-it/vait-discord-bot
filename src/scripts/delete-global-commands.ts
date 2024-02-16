import { Result } from 'oxide.ts';
import { deployGlobalCommands } from '../commands/deploy-command';
import { loadEnv } from '../utils/loadEnv';
import { logger } from '../utils/logger';

const deploy = async () => {
  loadEnv();
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';

  logger.info('[delete-global-commands]: Deleting global commands');
  const op = await Result.safe(
    deployGlobalCommands([], [], {
      token,
      clientId,
    })
  );
  if (op.isOk()) {
    logger.info('[delete-global-commands]: Global commands deleted successfully');
    process.exit(0);
  }

  logger.error('[delete-global-commands]: Cannot delete global commands', op.unwrapErr());
  process.exit(1);
};

deploy();
