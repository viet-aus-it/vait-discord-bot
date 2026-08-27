import { eq, sql } from 'drizzle-orm';

import { getDbClient } from '../../clients';
import { reputationLog, user } from '../../clients/db/schema/schema';

export const getOrCreateUser = async (userId: string) => {
  const db = getDbClient();

  let userRow = await db.query.user.findFirst({ where: { id: userId } });
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

  const [updatedUser] = await db.transaction(async (tx) => {
    const reputationUpdate =
      'increment' in adjustment.reputation
        ? sql`${user.reputation} + ${adjustment.reputation.increment}`
        : 'decrement' in adjustment.reputation
          ? sql`${user.reputation} - ${adjustment.reputation.decrement}`
          : adjustment.reputation.set;

    const updated = await tx.update(user).set({ reputation: reputationUpdate }).where(eq(user.id, toUserId)).returning();
    await tx.insert(reputationLog).values({ fromUserId, toUserId, operation });
    return updated;
  });

  return updatedUser;
};

export const getRepLeaderboard = async (size: number) => {
  const db = getDbClient();

  return db.query.user.findMany({
    where: { reputation: { gt: 0 } },
    orderBy: { reputation: 'desc' },
    columns: {
      id: true,
      reputation: true,
    },
    limit: size,
  });
};
