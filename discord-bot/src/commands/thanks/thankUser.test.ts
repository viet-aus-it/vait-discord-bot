import { Collection, User } from 'discord.js';
import { thankUser } from './thankUser';
import { getPrismaClient } from '../../clients/prisma';

jest.mock('../../clients/prisma', () => ({
  getPrismaClient: jest.fn(),
}));

const replyMock = jest.fn(() => {});

describe('thankUser', () => {
  const findUniqueMock = jest.fn(() => ({ id: '0' }));
  const updateUserMock = jest.fn();
  const reputationCreateMock = jest.fn();
  const transactionMock = jest.fn(() => [{ id: 0 }]);
  (getPrismaClient as jest.Mock).mockReturnValue({});

  it('should do nothing if mentions more than one user', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as any);
    mockUsers.set('1', { id: '1' } as any);

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
    (getPrismaClient as jest.Mock).mockReturnValue({});

    await thankUser(mockMsg);

    expect(replyMock.mock.calls.length).toBe(0);
  });

  it('should do nothing if user mention himself', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as any);

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

    (getPrismaClient as jest.Mock).mockReturnValue({});

    await thankUser(mockMsg);

    expect(replyMock.mock.calls.length).toBe(0);
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

    (getPrismaClient as jest.Mock).mockReturnValue({
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    });

    await thankUser(mockMsg);
    expect(findUniqueMock.mock.calls.length).toBe(0);
    expect(replyMock.mock.calls.length).toBe(0);
    expect(reputationCreateMock.mock.calls.length).toBe(0);
    expect(transactionMock.mock.calls.length).toBe(0);
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

    (getPrismaClient as jest.Mock).mockReturnValue({
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    });

    await thankUser(mockMsg);
    expect(findUniqueMock.mock.calls.length).toBe(0);
    expect(replyMock.mock.calls.length).toBe(0);
    expect(reputationCreateMock.mock.calls.length).toBe(0);
    expect(transactionMock.mock.calls.length).toBe(0);
  });

  it('should call reply', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as any);

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

    (getPrismaClient as jest.Mock).mockReturnValue({
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    });

    await thankUser(mockMsg);

    expect(findUniqueMock.mock.calls.length).toBe(1);
    expect(updateUserMock.mock.calls.length).toBe(1);
    expect(reputationCreateMock.mock.calls.length).toBe(1);
    expect(transactionMock.mock.calls.length).toBe(1);
    expect(replyMock.mock.calls.length).toBe(1);
  });
});
