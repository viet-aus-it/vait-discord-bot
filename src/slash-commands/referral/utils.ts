import { and, eq, lt } from 'drizzle-orm';

import { getDbClient } from '../../clients';
import { referralCode } from '../../clients/db/schema/schema';
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
  const [row] = await db.insert(referralCode).values({ userId, guildId, service, code, expiryDate }).returning();
  return row;
};

export type FindExistingReferralCodeInput = {
  userId: string;
  guildId: string;
  service: string;
};
export const findExistingReferralCode = async ({ userId, guildId, service }: FindExistingReferralCodeInput) => {
  const db = getDbClient();
  return db.query.referralCode.findFirst({ where: { userId, guildId, service } });
};

export type GetAllReferralCodesForServiceInput = {
  guildId: string;
  service: string;
};
export const getAllReferralCodesForService = async ({ guildId, service }: GetAllReferralCodesForServiceInput) => {
  const db = getDbClient();
  return db.query.referralCode.findMany({
    where: { guildId, service, expiryDate: { gte: new Date() } },
  });
};

export const cleanupExpiredCode = async () => {
  const db = getDbClient();
  const currentDate = new Date();
  return db.delete(referralCode).where(lt(referralCode.expiryDate, currentDate));
};

export type GetUserReferralCodesInput = {
  userId: string;
  guildId: string;
};
export const getUserReferralCodes = async ({ userId, guildId }: GetUserReferralCodesInput) => {
  const db = getDbClient();
  return db.query.referralCode.findMany({
    where: { userId, guildId, expiryDate: { gte: new Date() } },
    orderBy: { service: 'asc' },
  });
};

export type UpdateReferralCodeInput = {
  service: string;
  userId: string;
  guildId: string;
  code?: string;
  expiryDate?: Date;
};
export const updateReferralCode = async ({ service, userId, guildId, code, expiryDate }: UpdateReferralCodeInput) => {
  const db = getDbClient();
  const result = await db
    .update(referralCode)
    .set({
      ...(code && { code }),
      ...(expiryDate && { expiryDate }),
    })
    .where(and(eq(referralCode.service, service), eq(referralCode.userId, userId), eq(referralCode.guildId, guildId)));

  return { count: result.rowCount ?? 0 };
};

export type DeleteReferralCodeInput = {
  service: string;
  userId: string;
  guildId: string;
};
export const deleteReferralCode = async ({ service, userId, guildId }: DeleteReferralCodeInput) => {
  const db = getDbClient();
  const result = await db
    .delete(referralCode)
    .where(and(eq(referralCode.service, service), eq(referralCode.userId, userId), eq(referralCode.guildId, guildId)));

  return { count: result.rowCount ?? 0 };
};
