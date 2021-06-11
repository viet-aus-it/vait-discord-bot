import { PrismaClient } from '.prisma/client';

export const getOrCreateUser = async (prisma: PrismaClient, userId: string) => {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    user = await prisma.user.create({ data: { id: userId } });
  }

  return user;
};
