import { mocked } from 'ts-jest/utils';
import { checkReputation } from './checkReputation';
import { getOrCreateUser } from './_helpers';

jest.mock('./_helpers');
const mockGetOrCreateUser = mocked(getOrCreateUser);

describe('checkReputation', () => {
  it('should send reply if message is "-rep"', async () => {
    mockGetOrCreateUser.mockResolvedValueOnce({
      id: '1',
      reputation: 0,
    });
    const replyMock = jest.fn(() => {});
    const messageMock: any = {
      content: '-rep',
      author: { id: '1' },
      reply: replyMock,
    };

    await checkReputation(messageMock);

    expect(mockGetOrCreateUser).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});
