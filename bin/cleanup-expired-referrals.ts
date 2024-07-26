import { SpanStatusCode, trace } from '@opentelemetry/api';
import { Result } from 'oxide.ts';
import { cleanupExpiredCode } from '../src/slash-commands/referral/utils';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { setupTracer } from './tracing';

const cleanup = async () => {
  loadEnv();
  setupTracer();
  const tracer = trace.getTracer('discord-bot');
  await tracer.startActiveSpan('cleanup-expired-referrals', async (span) => {
    logger.info('[cleanup-expired-referrals]: CLEANING UP EXPIRED REFERRALS');
    span.setStatus({
      code: SpanStatusCode.UNSET,
      message: 'Cleaning up expired referrals',
    });

    const op = await Result.safe(cleanupExpiredCode());
    if (op.isErr()) {
      logger.error('[cleanup-expired-referrals]: Error cleaning up expired referrals');
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Error cleaning up expired referrals',
      });
      span.setAttributes({
        'app.error': op.unwrapErr().toString(),
      });

      process.exit(1);
    }

    logger.info('[cleanup-expired-referrals]: Removed expired referrals');
    span.setStatus({
      code: SpanStatusCode.OK,
      message: 'Removed expired referrals',
    });
  });

  process.exit(0);
};

cleanup();
