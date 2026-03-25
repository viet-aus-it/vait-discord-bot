import { performance } from 'node:perf_hooks';
import { Result } from 'oxide.ts';
import { cleanupExpiredCode } from '../src/slash-commands/referral/utils';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { recordSpanError, tracer } from '../src/utils/tracer';

const cleanup = async () => {
  loadEnv();
  logger.info('[cleanup-expired-referrals]: CLEANING UP EXPIRED REFERRALS');

  return tracer.startActiveSpan('cleanupExpiredReferrals', async (span) => {
    const start = performance.now();

    try {
      const op = await Result.safe(cleanupExpiredCode());
      if (op.isErr()) {
        recordSpanError(span, op.unwrapErr(), 'err-cleanup-referrals-failed');
        logger.error('[cleanup-expired-referrals]: Error cleaning up expired referrals', { error: op.unwrapErr() });
        span.end();
        process.exit(1);
      }

      logger.info('[cleanup-expired-referrals]: Removed expired referrals');
      span.setAttribute('job.duration_ms', performance.now() - start);
      span.end();
      process.exit(0);
    } finally {
      span.end();
    }
  });
};

cleanup();
