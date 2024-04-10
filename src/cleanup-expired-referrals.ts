import { Result } from 'oxide.ts';
import { cleanupExpiredCode } from './commands/referral/cleanupExpiredCode';
import { loadEnv } from './utils/load-env';
import { logger } from './utils/logger';

const cleanup = async () => {
  loadEnv();
  logger.info('[cleanup-expired-referrals]: CLEANING UP EXPIRED REFERRALS');

  const op = await Result.safe(cleanupExpiredCode());
  if (op.isErr()) {
    logger.error('[cleanup-expired-referrals]: Error cleaning up expired referrals');
    process.exit(1);
  }

  logger.info('[cleanup-expired-referrals]: Removed expired referrals');
  process.exit(0);
};

cleanup();
