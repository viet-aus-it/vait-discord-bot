import { checkReputation } from './checkReputation';
import { getPrismaClient } from '../../clients/prisma';

jest.mock('../../clients/prisma', () => ({
  getPrismaClient: jest.fn(),
}));

const replyMock = jest.fn(() => {});
const findUniqueMock = jest.fn(() => ({ id: '1' }));

describe('checkReputation', () => {
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
