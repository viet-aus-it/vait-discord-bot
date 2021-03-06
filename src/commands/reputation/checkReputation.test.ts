import { vi, it, describe, expect } from 'vitest';
import { checkReputation } from './checkReputation';
import { getOrCreateUser } from './_helpers';

vi.mock('./_helpers');
const mockGetOrCreateUser = vi.mocked(getOrCreateUser);
const replyMock = vi.fn();

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
