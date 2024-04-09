import type { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { isAdmin } from '../../utils/isSentFromAdmin';
import { getOrCreateUser, updateRep } from './_helpers';
import { setReputation } from './setReputation';

vi.mock('./_helpers');
const mockCreateUpdateUser = vi.mocked(getOrCreateUser);
const mockUpdateRep = vi.mocked(updateRep);

vi.mock('../../utils/isSentFromAdmin');
const mockIsSentFromAdmin = vi.mocked(isAdmin);

const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('setRep', () => {
  beforeAll(() => {
    mockIsSentFromAdmin.mockReturnValue(true);
  });

  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('should reply with an error message if the user is not an admin', async () => {
    mockIsSentFromAdmin.mockReturnValueOnce(false);

    await setReputation(mockInteraction);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledWith("You don't have enough permission to run this command.");
  });

  it('Should call reply when user mentions another user', async () => {
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '1', reputation: 1 }).mockResolvedValueOnce({ id: '0', reputation: 1 });
    mockUpdateRep.mockResolvedValueOnce({ id: '0', reputation: 1234 });
    const mockUser = { id: '0' } as User;
    mockInteraction.member!.user.id = '1';
    mockInteraction.options.getUser.mockReturnValueOnce(mockUser);
    mockInteraction.options.getInteger.mockReturnValueOnce(1234);
    mockInteraction.guild!.members.cache.get.mockImplementation((key) => {
      return { displayName: `test${key}` } as GuildMember;
    });

    await setReputation(mockInteraction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith("test1 just set test0's rep to 1234.\ntest0 → 1234 reps");
  });
});
