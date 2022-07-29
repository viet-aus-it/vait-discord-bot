import { vi, it, describe, expect } from 'vitest';
import { User } from 'discord.js';
import { setReputation } from './setReputation.js';
import { getOrCreateUser, updateRep } from './_helpers.js';
import { isAdmin } from '../../utils/index.js';

vi.mock('./_helpers');
const mockCreateUpdateUser = vi.mocked(getOrCreateUser);
const mockUpdateRep = vi.mocked(updateRep);

vi.mock('../../utils/isSentFromAdmin');
const mockIsSentFromAdmin = vi.mocked(isAdmin);

const replyMock = vi.fn(() => {});

describe('setRep', () => {
  beforeAll(() => {
    mockIsSentFromAdmin.mockReturnValue(true);
  });

  it('should reply with an error message if the user is not an admin', async () => {
    mockIsSentFromAdmin.mockReturnValueOnce(false);
    const mockInteraction: any = {
      reply: replyMock,
      options: {},
      guild: {},
      member: {},
    };

    await setReputation(mockInteraction);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(replyMock).toHaveBeenCalled();
    expect(replyMock).toHaveBeenCalledWith(
      "You don't have enough permission to run this command."
    );
  });

  it('Should call reply when user mentions another user', async () => {
    const mockUser = { id: '0' } as User;
    mockCreateUpdateUser
      .mockResolvedValueOnce({ id: '1', reputation: 1 })
      .mockResolvedValueOnce({ id: '0', reputation: 1 });
    mockUpdateRep.mockResolvedValueOnce({ id: '0', reputation: 1234 });

    const mockInteraction: any = {
      reply: replyMock,
      member: {
        user: {
          id: '1',
        },
      },
      options: {
        getUser: vi.fn(() => mockUser),
        getInteger: vi.fn(() => 1234),
      },
    };
    await setReputation(mockInteraction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      "<@1> just set <@0>'s rep to 1234. \n<@0>'s current rep: 1234"
    );
  });
});
