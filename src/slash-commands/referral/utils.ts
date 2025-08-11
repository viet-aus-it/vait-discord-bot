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

export type GetUserReferralCodesInput = {
  userId: string;
  guildId: string;
};
export const getUserReferralCodes = async ({ userId, guildId }: GetUserReferralCodesInput) => {
  const db = getDbClient();
  return db.referralCode.findMany({
    where: {
      userId,
      guildId,
      expiry_date: {
        gte: new Date(),
      },
    },
    orderBy: {
      service: 'asc',
    },
  });
};

export type UpdateReferralCodeInput = {
  id: string;
  userId: string;
  guildId: string;
  code?: string;
  expiryDate?: Date;
};
export const updateReferralCode = async ({ id, userId, guildId, code, expiryDate }: UpdateReferralCodeInput) => {
  const db = getDbClient();
  return db.referralCode.updateMany({
    where: {
      id,
      userId, // Ensure user can only update their own referrals
      guildId,
    },
    data: {
      ...(code && { code }),
      ...(expiryDate && { expiry_date: expiryDate }),
    },
  });
};

export type DeleteReferralCodeInput = {
  id: string;
  userId: string;
  guildId: string;
};
export const deleteReferralCode = async ({ id, userId, guildId }: DeleteReferralCodeInput) => {
  const db = getDbClient();
  return db.referralCode.deleteMany({
    where: {
      id,
      userId, // Ensure user can only delete their own referrals
      guildId,
    },
  });
};

export type GetReferralCodeByIdInput = {
  id: string;
  userId: string;
  guildId: string;
};
export const getReferralCodeById = async ({ id, userId, guildId }: GetReferralCodeByIdInput) => {
  const db = getDbClient();
  return db.referralCode.findFirst({
    where: {
      id,
      userId, // Ensure user can only access their own referrals
      guildId,
    },
  });
};
