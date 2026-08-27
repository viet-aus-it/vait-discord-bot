import { desc, eq, gt } from 'drizzle-orm';

import { getDbClient } from '../../clients';
import { reputationLog, user } from '../../clients/database/schema/schema';

export const getOrCreateUser = async (userId: string) => {
  const db = getDbClient();

  const existing = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  let userRow = existing[0];
  if (!userRow) {
    const [created] = await db.insert(user).values({ id: userId }).returning();
    userRow = created;
  }

  return userRow;
};

type NumberAdjustment = { increment: number } | { decrement: number } | { set: number };

const getAdjustmentOperation = (adjustment: NumberAdjustment) =>
  Object.entries(adjustment).map(([key, value]) => {
    return { operation: key, value };
  })[0];

interface IUpdateRep {
  fromUserId: string;
  toUserId: string;
  adjustment: { reputation: NumberAdjustment };
}

export const updateRep = async ({ fromUserId, toUserId, adjustment }: IUpdateRep) => {
  const db = getDbClient();

  const operation = getAdjustmentOperation(adjustment.reputation);

  const [[updatedUser]] = await db.transaction(async (tx) => {
    const updated = await tx.update(user).set(adjustment).where(eq(user.id, toUserId)).returning();
    await tx.insert(reputationLog).values({ fromUserId, toUserId, operation });
    return updated;
  });

  return updatedUser;
};

export const getRepLeaderboard = async (size: number) => {
  const db = getDbClient();

  return db.select({ id: user.id, reputation: user.reputation }).from(user).where(gt(user.reputation, 0)).orderBy(desc(user.reputation)).limit(size);
};
