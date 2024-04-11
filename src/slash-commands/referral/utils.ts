import { getDbClient } from '../../clients';
import { getOrCreateUser } from '../reputation/utils';

export type CreateReferralInput = {
  userId: string;
  guildId: string;
  service: string;
  code: string;
  expiryDate: Date;
};
export const createReferralCode = async ({ userId, guildId, service, code, expiryDate }: CreateReferralInput) => {
  const db = getDbClient();
  await getOrCreateUser(userId);
  return db.referralCode.create({
    data: {
      userId,
      guildId,
      service,
      code,
      expiry_date: expiryDate,
    },
  });
};

export type FindExistingReferralCodeInput = {
  userId: string;
  guildId: string;
  service: string;
};
export const findExistingReferralCode = async ({ userId, guildId, service }: FindExistingReferralCodeInput) => {
  const db = getDbClient();
  return db.referralCode.findFirst({
    where: {
      userId,
      guildId,
      service,
    },
  });
};

export type GetAllReferralCodesForServiceInput = {
  guildId: string;
  service: string;
};
export const getAllReferralCodesForService = async ({ guildId, service }: GetAllReferralCodesForServiceInput) => {
  const db = getDbClient();
  return db.referralCode.findMany({
    where: {
      guildId,
      service,
      expiry_date: {
        gte: new Date(),
      },
    },
  });
};

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
