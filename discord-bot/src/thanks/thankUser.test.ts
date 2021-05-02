import { Collection, User } from 'discord.js';
import { thankUser } from './thankUser';

const replyMock = jest.fn(() => {});

describe('thankUser', () => {
  const findUniqueMock = jest.fn(() => ({ id: '0' }));
  const updateUserMock = jest.fn();
  const reputationCreateMock = jest.fn();
  const transactionMock = jest.fn(() => [{ id: 0 }]);
  it('should do nothing if message not contains keyword', async () => {
    const mockMsg: any = {
      content: 'bla bla',
      reply: replyMock,
    };
    const mockBotId = '0';
    const mockPrisma: any = {};

    await thankUser(mockMsg, mockBotId, mockPrisma);

    expect(replyMock.mock.calls.length).toBe(0);
  });

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
    const mockBotId = '0';
    const mockPrisma: any = {};

    await thankUser(mockMsg, mockBotId, mockPrisma);

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

    const mockBotId = '0';
    const mockPrisma: any = {};

    await thankUser(mockMsg, mockBotId, mockPrisma);

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

    const mockBotId = '0';
    const mockPrisma: any = {
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    };

    await thankUser(mockMsg, mockBotId, mockPrisma);
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

    const mockBotId = '0';
    const mockPrisma: any = {
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    };

    await thankUser(mockMsg, mockBotId, mockPrisma);
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

    const mockBotId = '2';
    const mockPrisma: any = {
      user: {
        findUnique: findUniqueMock,
        update: updateUserMock,
      },
      reputationLog: {
        create: reputationCreateMock,
      },
      $transaction: transactionMock,
    };

    await thankUser(mockMsg, mockBotId, mockPrisma);

    expect(findUniqueMock.mock.calls.length).toBe(1);
    expect(updateUserMock.mock.calls.length).toBe(1);
    expect(reputationCreateMock.mock.calls.length).toBe(1);
    expect(transactionMock.mock.calls.length).toBe(1);
    expect(replyMock.mock.calls.length).toBe(1);
  });
});
