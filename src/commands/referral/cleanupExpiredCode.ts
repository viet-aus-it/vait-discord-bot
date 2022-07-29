import { ReferralCode } from '@prisma/client';
import { getPrismaClient } from '../../clients/index.js';
import { parseDate } from './parseDate.js';

export const cleanupExpiredCode = (
  referrals: ReferralCode[]
): ReferralCode[] => {
  const prisma = getPrismaClient();

  const [expiredIds, filteredReferrals] = referrals.reduce<
    [string[], ReferralCode[]]
  >(
    (total, referral) => {
      const expiryDate = new Date(referral.expiry_date).toLocaleDateString(
        'en-AU'
      );
      const [parseDateCase] = parseDate(expiryDate);
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
      prisma.referralCode.deleteMany({
        where: { id: { in: expiredIds } },
      });
    } catch (error) {
      console.error(error);
    }
  }

  return filteredReferrals;
};
