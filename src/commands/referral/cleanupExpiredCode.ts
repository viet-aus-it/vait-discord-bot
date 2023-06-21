import { getPrismaClient } from '../../clients';
import { OpResult } from '../../utils/opResult';

export const cleanupExpiredCode = async (): Promise<OpResult<unknown>> => {
  const prisma = getPrismaClient();
  const currentDate = new Date();
  try {
    const result = await prisma.referralCode.deleteMany({
      where: {
        expiry_date: {
          lt: currentDate,
        },
      },
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error,
    };
  }
};
