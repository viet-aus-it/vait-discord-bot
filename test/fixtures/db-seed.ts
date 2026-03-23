import { getDbClient } from '../../src/clients';

export const seedUser = async (id: string, reputation = 0) => {
  const db = getDbClient();
  return db.user.create({ data: { id, reputation } });
};

export const seedServerSettings = async (guildId: string, overrides: Record<string, unknown> = {}) => {
  const db = getDbClient();
  return db.serverChannelsSettings.create({ data: { guildId, ...overrides } });
};

export const seedReferralCode = async (data: { userId: string; guildId: string; service: string; code: string; expiry_date: Date }) => {
  const db = getDbClient();
  return db.referralCode.create({ data });
};

export const seedReminder = async (data: { userId: string; guildId: string; onTimestamp: number; message: string }) => {
  const db = getDbClient();
  return db.reminder.create({ data });
};

export const cleanDb = async () => {
  const db = getDbClient();
  await db.reputationLog.deleteMany();
  await db.referralCode.deleteMany();
  await db.reminder.deleteMany();
  await db.user.deleteMany();
  await db.aocLeaderboard.deleteMany();
  await db.serverChannelsSettings.deleteMany();
};
