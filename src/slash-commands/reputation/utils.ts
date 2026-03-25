import { getDbClient } from '../../clients';

export const getOrCreateUser = async (userId: string) => {
  const db = getDbClient();

  let user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    user = await db.user.create({ data: { id: userId } });
  }

  return user;
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

  const updatedUserPromise = db.user.update({
    where: { id: toUserId },
    data: adjustment,
  });

  const operation = getAdjustmentOperation(adjustment.reputation);

  const logPromise = db.reputationLog.create({
    data: {
      fromUserId,
      toUserId,
      operation,
    },
  });

  const [updatedUser] = await db.$transaction([updatedUserPromise, logPromise]);

  return updatedUser;
};

export const getRepLeaderboard = async (size: number) => {
  const db = getDbClient();

  return db.user.findMany({
    where: { reputation: { gt: 0 } },
    orderBy: [{ reputation: 'desc' }],
    select: {
      id: true,
      reputation: true,
    },
    take: size,
  });
};
