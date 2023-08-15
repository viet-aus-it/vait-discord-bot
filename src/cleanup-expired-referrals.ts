import { getUnixTime } from 'date-fns';
import { Result } from 'oxide.ts';
import { cleanupExpiredCode } from './commands/referral/cleanupExpiredCode';
import { loadEnv } from './utils/loadEnv';
import { logger } from './utils/logger';
import { getCurrentUnixTime } from './utils/dateUtils';

const cleanup = async () => {
  loadEnv();
  logger.info(
    `CLEANING UP EXPIRED REFERRALS. Current Timestamp: ${getCurrentUnixTime()}`
  );

  const op = await Result.safe(cleanupExpiredCode());
  if (op.isErr()) {
    logger.error(
      `Error cleaning up expired referrals. timestamp: ${getCurrentUnixTime()}`
    );
    process.exit(1);
  }

  logger.info(`Removed expired referrals. Timestamp: ${getCurrentUnixTime()}`);
  process.exit(0);
};

cleanup();
