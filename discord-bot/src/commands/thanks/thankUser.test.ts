import { Collection, User } from 'discord.js';
import { thankUser } from './thankUser';
import { getPrismaClient } from '../../clients/prisma';

jest.mock('../../clients/prisma');
const mockGetPrismaClient = getPrismaClient as jest.MockedFunction<
  typeof getPrismaClient
>;

const replyMock = jest.fn(() => {});

describe('thankUser', () => {
  const findUniqueMock = jest.fn(() => ({ id: '0' }));
  const updateUserMock = jest.fn();
  const reputationCreateMock = jest.fn();
  const transactionMock = jest.fn(() => [{ id: 0 }]);

  it('should do nothing if mentions more than one user', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    mockUsers.set('1', { id: '1' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      author: {
        bot: false,
      },
    };

    const mockPrismaClient: any = {};
    mockGetPrismaClient.mockReturnValue(mockPrismaClient);

    await thankUser(mockMsg);

    expect(replyMock).not.toHaveBeenCalled();
  });

  it('should do nothing if user mention himself', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '0',
        bot: false,
      },
    };

    const mockPrismaClient: any = {};
    mockGetPrismaClient.mockReturnValue(mockPrismaClient);

    await thankUser(mockMsg);

    expect(replyMock).not.toHaveBeenCalled();
  });

  it('should do nothing if user mention no one', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: {
          first: () => undefined,
          size: 1,
        },
      },
      author: {
        id: '5',
        bot: false,
      },
    };

    const mockPrismaClient: any = {
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    };
    mockGetPrismaClient.mockReturnValue(mockPrismaClient);

    await thankUser(mockMsg);
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(replyMock).not.toHaveBeenCalled();
    expect(reputationCreateMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('should do nothing if bot is mentioned', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1', bot: true } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '5',
        bot: false,
      },
    };

    const mockPrismaClient: any = {
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    };
    mockGetPrismaClient.mockReturnValue(mockPrismaClient);

    await thankUser(mockMsg);
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(replyMock).not.toHaveBeenCalled();
    expect(reputationCreateMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('should do nothing if bot is saying the keywords', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '2' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '0',
        bot: true,
      },
    };

    const mockPrismaClient: any = {
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    };
    mockGetPrismaClient.mockReturnValue(mockPrismaClient);

    await thankUser(mockMsg);
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(replyMock).not.toHaveBeenCalled();
    expect(reputationCreateMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('should call reply', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '1',
      },
    };

    const mockPrismaClient: any = {
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    };
    mockGetPrismaClient.mockReturnValue(mockPrismaClient);

    await thankUser(mockMsg);

    expect(findUniqueMock).toHaveBeenCalledTimes(1);
    expect(updateUserMock).toHaveBeenCalledTimes(1);
    expect(reputationCreateMock).toHaveBeenCalledTimes(1);
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});
