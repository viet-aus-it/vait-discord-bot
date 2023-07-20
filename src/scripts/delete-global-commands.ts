import { Result } from 'oxide.ts';
import { deployGlobalCommands } from '../commands/deploy-command';
import { loadEnv } from '../utils/loadEnv';
import { getLogger } from '../utils/logger';

const deploy = async () => {
  loadEnv();
  const logger = getLogger();
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';

  const op = await Result.safe(
    deployGlobalCommands([], [], {
      token,
      clientId,
    })
  );
  if (op.isOk()) {
    process.exit(0);
  }

  logger.error('Cannot delete commands', op.unwrapErr());
  process.exit(1);
};

deploy();
