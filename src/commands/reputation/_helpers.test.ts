import { getPrismaClient } from '../../clients';
import { getOrCreateUser, updateRep } from './_helpers';

jest.mock('../../clients');
const mockGetPrismaClient = jest.mocked(getPrismaClient);

describe('getOrCreateUser', () => {
  it('should return user if user is existed', async () => {
    const mockPrisma: any = {
      user: {
        findUnique: () => ({ id: '1' }),
      },
    };
    mockGetPrismaClient.mockReturnValueOnce(mockPrisma);

    const user = await getOrCreateUser('1');
    expect(user.id).toBe('1');
  });

  it('should return user even if user is not existed', async () => {
    const mockPrisma: any = {
      user: {
        findUnique: () => null,
        create: () => ({ id: '1' }),
      },
    };
    mockGetPrismaClient.mockReturnValueOnce(mockPrisma);

    const user = await getOrCreateUser('1');
    expect(user.id).toBe('1');
  });
});

describe('updateRep', () => {
  const testCases = [
    {
      description: 'Should add a rep to a user',
      adjustment: { reputation: { increment: 1 } },
    },
    {
      description: 'Should remove a rep from a user',
      adjustment: { reputation: { decrement: 1 } },
    },
    {
      description: "Should set a user's rep",
      adjustment: { reputation: { set: 1 } },
    },
  ];

  testCases.forEach(({ description, adjustment }) => {
    it(description, async () => {
      const mockPrisma: any = {
        user: {
          update: async () => ({
            id: '1',
            reputation: 1,
          }),
        },
        reputationLog: {
          create: () => Promise.resolve(undefined),
        },
        $transaction: async () => [
          {
            id: '1',
            reputation: 1,
          },
        ],
      };
      mockGetPrismaClient.mockReturnValueOnce(mockPrisma);

      const result = await updateRep({
        fromUserId: '2',
        toUserId: '1',
        adjustment,
      });

      expect(result.reputation).toBe(1);
    });
  });
});
