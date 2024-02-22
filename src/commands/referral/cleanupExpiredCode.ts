import { getDbClient } from '../../clients';

export const cleanupExpiredCode = async () => {
  const db = getDbClient();
  const currentDate = new Date();
  return db.referralCode.deleteMany({
    where: {
      expiry_date: {
        lt: currentDate,
      },
    },
  });
};
