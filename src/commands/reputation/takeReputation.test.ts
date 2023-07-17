import { vi, it, describe, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import { takeReputation } from './takeReputation';
import { getOrCreateUser, updateRep } from './_helpers';
import { isAdmin } from '../../utils';

vi.mock('./_helpers');
const mockCreateUpdateUser = vi.mocked(getOrCreateUser);
const mockUpdateRep = vi.mocked(updateRep);

vi.mock('../../utils/isSentFromAdmin');
const mockIsSentFromAdmin = vi.mocked(isAdmin);

const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('takeRep', () => {
  beforeAll(() => {
    mockIsSentFromAdmin.mockReturnValue(true);
  });

  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('should reply with an error message if the user is not an admin', async () => {
    mockIsSentFromAdmin.mockReturnValueOnce(false);

    await takeReputation(mockInteraction);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      "You don't have enough permission to run this command."
    );
  });

  it('should send a message if the user has 0 rep', async () => {
    mockCreateUpdateUser
      .mockResolvedValueOnce({ id: '1', reputation: 0 })
      .mockResolvedValueOnce({ id: '0', reputation: 0 });
    const mockUser = { id: '0' } as User;
    mockInteraction.member!.user.id = '1';
    mockInteraction.options.getUser.mockReturnValueOnce(mockUser);

    await takeReputation(mockInteraction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      '<@0> currently has 0 rep'
    );
  });

  it('Should call reply when user mentions another user', async () => {
    mockCreateUpdateUser
      .mockResolvedValueOnce({ id: '1', reputation: 10 })
      .mockResolvedValueOnce({ id: '0', reputation: 10 });
    mockUpdateRep.mockResolvedValueOnce({ id: '0', reputation: 0 });
    const mockUser = { id: '0' } as User;
    mockInteraction.guild!.members.cache.get.mockImplementation((key) => {
      return { displayName: `test${key}` } as GuildMember;
    });
    mockInteraction.member!.user.id = '1';
    mockInteraction.options.getUser.mockReturnValueOnce(mockUser);

    await takeReputation(mockInteraction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      'test1 took 1 rep from test0.\ntest0 → 0 reps'
    );
  });
});
