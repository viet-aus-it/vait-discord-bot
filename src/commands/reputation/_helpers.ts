import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../../clients/index.js';

export const getOrCreateUser = async (userId: string) => {
  const prisma = getPrismaClient();

  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    user = await prisma.user.create({ data: { id: userId } });
  }

  return user;
};

type NumberAdjustment =
  | { increment: number }
  | { decrement: number }
  | { set: number };

const getAdjustmentOperation = (adjustment: NumberAdjustment) =>
  Object.entries(adjustment).map(([key, value]) => {
    return { operation: key, value };
  })[0];

interface IUpdateRep {
  fromUserId: string;
  toUserId: string;
  adjustment: { reputation: NumberAdjustment };
}

export const updateRep = async ({
  fromUserId,
  toUserId,
  adjustment,
}: IUpdateRep) => {
  const prisma = getPrismaClient();

  const updatedUserPromise = prisma.user.update({
    where: { id: toUserId },
    data: adjustment,
  });

  const operation = getAdjustmentOperation(
    adjustment.reputation
  ) as Prisma.JsonObject;

  const logPromise = prisma.reputationLog.create({
    data: {
      fromUserId,
      toUserId,
      operation,
    },
  });

  const [updatedUser] = await prisma.$transaction([
    updatedUserPromise,
    logPromise,
  ]);

  return updatedUser;
};
