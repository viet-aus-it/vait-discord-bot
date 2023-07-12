import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { getUnixTime } from 'date-fns';
import { cleanupExpiredCode } from './commands/referral/cleanupExpiredCode';
import { Result } from 'oxide.ts';

const env = dotenv.config();
dotenvExpand.expand(env);

const cleanup = async () => {
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
