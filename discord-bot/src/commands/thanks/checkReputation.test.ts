import { checkReputation } from './checkReputation';
import { getPrismaClient } from '../../clients/prisma';

jest.mock('../../clients/prisma');
const mockGetPrismaClient = getPrismaClient as jest.MockedFunction<
  typeof getPrismaClient
>;

const replyMock = jest.fn(() => {});
const findUniqueMock = jest.fn(() => ({ id: '1' }));

describe('checkReputation', () => {
  it('should send reply if message is "-rep"', async () => {
    const messageMock: any = {
      content: '-rep',
      author: { id: '1' },
      reply: replyMock,
    };

    const mockPrismaClient: any = {
      user: { findUnique: findUniqueMock },
    };
    mockGetPrismaClient.mockReturnValue(mockPrismaClient);

    await checkReputation(messageMock);

    expect(findUniqueMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});
