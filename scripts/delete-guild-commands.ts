import { Result } from 'oxide.ts';
import { deployGuildCommands } from '../src/deploy-command';
import { getCurrentUnixTime } from '../src/utils/date';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';

const deploy = async () => {
  const env = loadEnv();

  if (!env.GUILD_ID) {
    throw new Error('GUILD_ID is not provided');
  }

  logger.info('[delete-guild-commands]: Deleting guild commands');
  const op = await Result.safe(
    deployGuildCommands([], {
      token: env.TOKEN,
      clientId: env.CLIENT_ID,
      guildId: env.GUILD_ID,
    })
  );
  if (op.isOk()) {
    logger.info('[delete-guild-commands]: Guild commands deleted successfully');
    process.exit(0);
  }

  logger.error(`[delete-guild-commands]: Cannot delete guild commands.`, op.unwrapErr());
  process.exit(1);
};

deploy();
