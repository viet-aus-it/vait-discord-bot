import { Result } from 'oxide.ts';

import { cleanupExpiredCode } from '../src/slash-commands/referral/utils';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { recordSpanError, setSpanAttributes, tracer } from '../src/utils/tracer';
import { shutdownTelemetry } from './telemetry';

const handleCleanup = async () => {
  const op = await Result.safe(cleanupExpiredCode());
  if (op.isErr()) {
    setSpanAttributes({ 'bot.referral.success': false, 'bot.referral.reason': 'cleanup-expired-referrals' });
    recordSpanError(op.unwrapErr(), 'err-cleanup-referrals-failed');
    logger.error('[cleanup-expired-referrals]: Error cleaning up expired referrals', op.unwrapErr());
    return 1;
  }

  logger.info('[cleanup-expired-referrals]: Removed expired referrals');
  return 0;
};

const cleanup = async () => {
  loadEnv();
  logger.info('[cleanup-expired-referrals]: CLEANING UP EXPIRED REFERRALS');

  const result = await tracer.startActiveSpan('cleanupExpiredReferrals', async (span) => {
    const op = await Result.safe(handleCleanup());
    span.end();
    return op;
  });

  const exitCode = result.isOk() ? result.unwrap() : 1;
  await shutdownTelemetry();
  process.exit(exitCode);
};

cleanup();
