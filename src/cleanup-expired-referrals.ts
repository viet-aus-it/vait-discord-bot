import { getUnixTime } from 'date-fns';
import { Result } from 'oxide.ts';
import { cleanupExpiredCode } from './commands/referral/cleanupExpiredCode';
import { loadEnv } from './utils/loadEnv';

const cleanup = async () => {
  loadEnv();
  console.log(
    `CLEANING UP EXPIRED REFERRALS. Current Timestamp: ${getUnixTime(
      new Date()
    )}`
  );

  const op = await Result.safe(cleanupExpiredCode());
  if (op.isErr()) {
    console.error(
      `Error cleaning up expired referrals. timestamp: ${getUnixTime(
        new Date()
      )}`
    );
    process.exit(1);
  }

  console.log(
    `Removed expired referrals. Timestamp: ${getUnixTime(new Date())}`
  );
  process.exit(0);
};

cleanup();
