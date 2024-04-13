import { Result } from 'oxide.ts';
import { deployGuildCommands } from '../src/commands/deploy-command';
import { getCurrentUnixTime } from '../src/utils/date';
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

  logger.info('[delete-guild-commands]: Deleting guild commands');
  const op = await Result.safe(
    deployGuildCommands([], {
      token,
      clientId,
      guildId,
    })
  );
  if (op.isOk()) {
    logger.info('[delete-guild-commands]: Guild commands deleted successfully');
    process.exit(0);
  }

  logger.error(`[delete-guild-commands]: Cannot delete guild commands. Timestamp ${getCurrentUnixTime()}`, op.unwrapErr());
  process.exit(1);
};

deploy();
