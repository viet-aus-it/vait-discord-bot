import { checkReputation } from './checkReputation';
import { getPrismaClient } from '../clients/prisma';

jest.mock('../clients/prisma', () => ({
  getPrismaClient: jest.fn(),
}));

const replyMock = jest.fn(() => {});
const findUniqueMock = jest.fn(() => ({ id: '1' }));

describe('checkReputation', () => {
  it('should do nothing if message is not "-rep"', async () => {
    const messageMock: any = {
      content: 'weeee',
      reply: replyMock,
    };

    (getPrismaClient as jest.Mock).mockReturnValue({});

    await checkReputation(messageMock);

    expect(replyMock.mock.calls.length).toBe(0);
  });

  it('should send reply if message is "-rep"', async () => {
    const messageMock: any = {
      content: '-rep',
      author: { id: '1' },
      reply: replyMock,
    };

    (getPrismaClient as jest.Mock).mockReturnValue({
      user: { findUnique: findUniqueMock },
    });

    await checkReputation(messageMock);

    expect(findUniqueMock.mock.calls.length).toBe(1);
    expect(replyMock.mock.calls.length).toBe(1);
  });
});
