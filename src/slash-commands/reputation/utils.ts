import { getDbClient } from '../../clients';
import { tracer } from '../../utils/tracer';

export const getOrCreateUser = async (userId: string) => {
  return tracer.startActiveSpan('db.user.getOrCreate', async (span) => {
    try {
      span.setAttribute('user.id', userId);
      const db = getDbClient();

      let user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        user = await db.user.create({ data: { id: userId } });
      }

      return user;
    } finally {
      span.end();
    }
  });
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
  return tracer.startActiveSpan('db.reputation.update', async (span) => {
    try {
      span.setAttribute('fromUserId', fromUserId);
      span.setAttribute('toUserId', toUserId);
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
    } finally {
      span.end();
    }
  });
};

export const getRepLeaderboard = async (size: number) => {
  return tracer.startActiveSpan('db.reputation.leaderboard', async (span) => {
    try {
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
    } finally {
      span.end();
    }
  });
};
