import { getUnixTime } from 'date-fns';
import { Result } from 'oxide.ts';
import { cleanupExpiredCode } from './commands/referral/cleanupExpiredCode';
import { loadEnv } from './utils/loadEnv';
import { logger } from './utils/logger';

const cleanup = async () => {
  loadEnv();
  logger.info(
    `CLEANING UP EXPIRED REFERRALS. Current Timestamp: ${getUnixTime(
      new Date()
    )}`
  );

  const op = await Result.safe(cleanupExpiredCode());
  if (op.isErr()) {
    logger.error(
      `Error cleaning up expired referrals. timestamp: ${getUnixTime(
        new Date()
      )}`
    );
    process.exit(1);
  }

  logger.info(
    `Removed expired referrals. Timestamp: ${getUnixTime(new Date())}`
  );
  process.exit(0);
};

cleanup();
