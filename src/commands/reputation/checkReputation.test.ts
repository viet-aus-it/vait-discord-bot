import { checkReputation } from './checkReputation';
import { getOrCreateUser } from './_helpers';

jest.mock('./_helpers');
const mockGetOrCreateUser = jest.mocked(getOrCreateUser);
const replyMock = jest.fn();

describe('checkReputation', () => {
  it('should send reply if message is "-rep"', async () => {
    mockGetOrCreateUser.mockResolvedValueOnce({
      id: '1',
      reputation: 0,
    });
    const mockInteraction: any = {
      reply: replyMock,
      member: {
        user: {
          id: '1',
        },
      },
    };

    await checkReputation(mockInteraction);

    expect(mockGetOrCreateUser).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});
