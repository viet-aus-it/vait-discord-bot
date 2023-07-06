import { getPrismaClient } from '../../clients';

export const cleanupExpiredCode = async () => {
  const prisma = getPrismaClient();
  const currentDate = new Date();
  return prisma.referralCode.deleteMany({
    where: {
      expiry_date: {
        lt: currentDate,
      },
    },
  });
};
