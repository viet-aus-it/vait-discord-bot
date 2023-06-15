import { vi, it, describe, expect } from 'vitest';
import { Collection, GuildMember, User } from 'discord.js';
import { setReputation } from './setReputation';
import { getOrCreateUser, updateRep } from './_helpers';
import { isAdmin } from '../../utils';

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
    const mockUserCollection = new Collection<string, GuildMember>();
    mockUserCollection.set('1', { displayName: 'test1' } as GuildMember);
    mockUserCollection.set('0', { displayName: 'test0' } as GuildMember);
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
      guild: {
        members: {
          cache: mockUserCollection,
        },
      },
    };
    await setReputation(mockInteraction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      "test1 just set test0's rep to 1234.\ntest0 → 1234 reps"
    );
  });
});
