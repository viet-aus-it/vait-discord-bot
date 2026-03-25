import { Result } from 'oxide.ts';
import { cleanupExpiredCode } from '../src/slash-commands/referral/utils';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { tracer } from '../src/utils/tracer';

const cleanup = async () => {
  loadEnv();
  logger.info('[cleanup-expired-referrals]: CLEANING UP EXPIRED REFERRALS');

  return tracer.startActiveSpan('cleanupExpiredReferrals', async (span) => {
    try {
      const op = await Result.safe(cleanupExpiredCode());
      if (op.isErr()) {
        span.setAttribute('error', true);
        span.setAttribute('error.message', String(op.unwrapErr()));
        logger.error('[cleanup-expired-referrals]: Error cleaning up expired referrals', { error: op.unwrapErr() });
        process.exit(1);
      }

      logger.info('[cleanup-expired-referrals]: Removed expired referrals');
      process.exit(0);
    } finally {
      span.end();
    }
  });
};

cleanup();
