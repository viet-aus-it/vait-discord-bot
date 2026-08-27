import { and, asc, eq, gte, lt } from 'drizzle-orm';

import { getDbClient } from '../../clients';
import { referralCode } from '../../clients/database/schema/schema';
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
  const rows = await db
    .select()
    .from(referralCode)
    .where(and(eq(referralCode.userId, userId), eq(referralCode.guildId, guildId), eq(referralCode.service, service)))
    .limit(1);

  return rows[0];
};

export type GetAllReferralCodesForServiceInput = {
  guildId: string;
  service: string;
};
export const getAllReferralCodesForService = async ({ guildId, service }: GetAllReferralCodesForServiceInput) => {
  const db = getDbClient();
  return db
    .select()
    .from(referralCode)
    .where(and(eq(referralCode.guildId, guildId), eq(referralCode.service, service), gte(referralCode.expiryDate, new Date())));
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
  return db
    .select()
    .from(referralCode)
    .where(and(eq(referralCode.userId, userId), eq(referralCode.guildId, guildId), gte(referralCode.expiryDate, new Date())))
    .orderBy(asc(referralCode.service));
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
  return db
    .update(referralCode)
    .set({
      ...(code && { code }),
      ...(expiryDate && { expiryDate }),
    })
    .where(and(eq(referralCode.service, service), eq(referralCode.userId, userId), eq(referralCode.guildId, guildId)));
};

export type DeleteReferralCodeInput = {
  service: string;
  userId: string;
  guildId: string;
};
export const deleteReferralCode = async ({ service, userId, guildId }: DeleteReferralCodeInput) => {
  const db = getDbClient();
  return db.delete(referralCode).where(and(eq(referralCode.service, service), eq(referralCode.userId, userId), eq(referralCode.guildId, guildId)));
};
