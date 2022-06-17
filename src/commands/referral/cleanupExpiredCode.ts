import { ReferralCode } from '@prisma/client';
import { getPrismaClient } from '../../clients';
import { parseDate } from './parseDate';

export const cleanupExpiredCode = (
  referrals: ReferralCode[]
): ReferralCode[] => {
  const prisma = getPrismaClient();

  const [expiredIds, filteredReferrals] = referrals.reduce<
    [string[], ReferralCode[]]
  >(
    (total, referral) => {
      const [parseDateCase] = parseDate(
        new Date(referral.expiry_date).toLocaleDateString()
      );
      if (parseDateCase !== 'SUCCESS') {
        total[0].push(referral.id);
      } else {
        total[1].push(referral);
      }

      return total;
    },
    [[], []]
  );

  // SOMETIMES try to clean expired referral codes
  if (expiredIds.length > 10) {
    try {
      // dont await so dont wait for clean up
      prisma.referralCode.deleteMany({
        where: { id: { in: expiredIds } },
      });
    } catch (error) {
      console.error(error);
    }
  }

  return filteredReferrals;
};
