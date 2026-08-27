import { getDbClient } from '../../src/clients';
import { aocLeaderboard, referralCode, reminder, reputationLog, serverChannelsSettings, user } from '../../src/clients/database/schema/schema';

export const seedUser = async (id: string, reputation = 0) => {
  const db = getDbClient();
  const [row] = await db.insert(user).values({ id, reputation }).returning();
  return row;
};

export const seedServerSettings = async (guildId: string, overrides: Record<string, unknown> = {}) => {
  const db = getDbClient();
  const [row] = await db
    .insert(serverChannelsSettings)
    .values({ guildId, ...overrides })
    .returning();
  return row;
};

export const seedReferralCode = async (data: { userId: string; guildId: string; service: string; code: string; expiryDate: Date }) => {
  const db = getDbClient();
  const [row] = await db.insert(referralCode).values(data).returning();
  return row;
};

export const seedReminder = async (data: { userId: string; guildId: string; onTimestamp: number; message: string }) => {
  const db = getDbClient();
  const [row] = await db.insert(reminder).values(data).returning();
  return row;
};

export const cleanDb = async () => {
  const db = getDbClient();
  await db.delete(reputationLog);
  await db.delete(referralCode);
  await db.delete(reminder);
  await db.delete(user);
  await db.delete(aocLeaderboard);
  await db.delete(serverChannelsSettings);
};
