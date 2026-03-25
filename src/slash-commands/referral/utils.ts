import { getDbClient } from '../../clients';
import { tracer } from '../../utils/tracer';
import { getOrCreateUser } from '../reputation/utils';

export type CreateReferralInput = {
  userId: string;
  guildId: string;
  service: string;
  code: string;
  expiryDate: Date;
};
export const createReferralCode = async ({ userId, guildId, service, code, expiryDate }: CreateReferralInput) => {
  return tracer.startActiveSpan('db.referral.create', async (span) => {
    try {
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
    } finally {
      span.end();
    }
  });
};

export type FindExistingReferralCodeInput = {
  userId: string;
  guildId: string;
  service: string;
};
export const findExistingReferralCode = async ({ userId, guildId, service }: FindExistingReferralCodeInput) => {
  return tracer.startActiveSpan('db.referral.findExisting', async (span) => {
    try {
      const db = getDbClient();
      return db.referralCode.findFirst({
        where: {
          userId,
          guildId,
          service,
        },
      });
    } finally {
      span.end();
    }
  });
};

export type GetAllReferralCodesForServiceInput = {
  guildId: string;
  service: string;
};
export const getAllReferralCodesForService = async ({ guildId, service }: GetAllReferralCodesForServiceInput) => {
  return tracer.startActiveSpan('db.referral.getAllForService', async (span) => {
    try {
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
    } finally {
      span.end();
    }
  });
};

export const cleanupExpiredCode = async () => {
  return tracer.startActiveSpan('db.referral.cleanupExpired', async (span) => {
    try {
      const db = getDbClient();
      const currentDate = new Date();
      return db.referralCode.deleteMany({
        where: {
          expiry_date: {
            lt: currentDate,
          },
        },
      });
    } finally {
      span.end();
    }
  });
};

export type GetUserReferralCodesInput = {
  userId: string;
  guildId: string;
};
export const getUserReferralCodes = async ({ userId, guildId }: GetUserReferralCodesInput) => {
  return tracer.startActiveSpan('db.referral.getUserCodes', async (span) => {
    try {
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
    } finally {
      span.end();
    }
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
  return tracer.startActiveSpan('db.referral.update', async (span) => {
    try {
      const db = getDbClient();
      return db.referralCode.updateMany({
        where: {
          service,
          userId,
          guildId,
        },
        data: {
          ...(code && { code }),
          ...(expiryDate && { expiry_date: expiryDate }),
        },
      });
    } finally {
      span.end();
    }
  });
};

export type DeleteReferralCodeInput = {
  service: string;
  userId: string;
  guildId: string;
};
export const deleteReferralCode = async ({ service, userId, guildId }: DeleteReferralCodeInput) => {
  return tracer.startActiveSpan('db.referral.delete', async (span) => {
    try {
      const db = getDbClient();
      return db.referralCode.deleteMany({
        where: {
          service,
          userId,
          guildId,
        },
      });
    } finally {
      span.end();
    }
  });
};
