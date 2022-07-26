import { vi, it, describe, expect } from 'vitest';
import { User } from 'discord.js';
import { takeReputation } from './takeReputation';
import { getOrCreateUser, updateRep } from './_helpers';
import { isAdmin } from '../../utils';

vi.mock('./_helpers');
const mockCreateUpdateUser = vi.mocked(getOrCreateUser);
const mockUpdateRep = vi.mocked(updateRep);

vi.mock('../../utils/isSentFromAdmin');
const mockIsSentFromAdmin = vi.mocked(isAdmin);

const replyMock = vi.fn(() => {});

describe('takeRep', () => {
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

    await takeReputation(mockInteraction);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(replyMock).toHaveBeenCalled();
    expect(replyMock).toHaveBeenCalledWith(
      "You don't have enough permission to run this command."
    );
  });

  it('should send a message if the user has 0 rep', async () => {
    const mockUser = { id: '0' } as User;
    mockCreateUpdateUser
      .mockResolvedValueOnce({ id: '1', reputation: 0 })
      .mockResolvedValueOnce({ id: '0', reputation: 0 });
    const mockInteraction: any = {
      reply: replyMock,
      member: {
        user: {
          id: '1',
        },
      },
      options: {
        getUser: vi.fn(() => mockUser),
      },
    };

    await takeReputation(mockInteraction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(replyMock).toHaveBeenCalledWith('<@0> currently has 0 rep');
  });

  it('Should call reply when user mentions another user', async () => {
    const mockUser = { id: '0' } as User;
    mockCreateUpdateUser
      .mockResolvedValueOnce({ id: '1', reputation: 10 })
      .mockResolvedValueOnce({ id: '0', reputation: 10 });
    mockUpdateRep.mockResolvedValueOnce({ id: '0', reputation: 0 });
    const mockInteraction: any = {
      reply: replyMock,
      member: {
        user: {
          id: '1',
        },
      },
      options: {
        getUser: vi.fn(() => mockUser),
      },
    };

    await takeReputation(mockInteraction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      "<@1> took from <@0> 1 rep. \n<@0>'s current rep: 0"
    );
  });
});
