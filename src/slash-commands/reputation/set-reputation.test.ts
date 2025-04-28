import type { GuildMember, User } from 'discord.js';
import { beforeAll, describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { isAdmin } from '../../utils/permission';
import { setReputation } from './set-reputation';
import { getOrCreateUser, updateRep } from './utils';

vi.mock('./utils');
const mockCreateUpdateUser = vi.mocked(getOrCreateUser);
const mockUpdateRep = vi.mocked(updateRep);

vi.mock('../../utils/permission');
const mockIsSentFromAdmin = vi.mocked(isAdmin);

describe('setRep', () => {
  beforeAll(() => {
    mockIsSentFromAdmin.mockReturnValue(true);
  });

  chatInputCommandInteractionTest('should reply with an error message if the user is not an admin', async ({ interaction }) => {
    mockIsSentFromAdmin.mockReturnValueOnce(false);

    await setReputation(interaction);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith("You don't have enough permission to run this command.");
  });

  chatInputCommandInteractionTest('Should call reply when user mentions another user', async ({ interaction }) => {
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '1', reputation: 1 }).mockResolvedValueOnce({ id: '0', reputation: 1 });
    mockUpdateRep.mockResolvedValueOnce({ id: '0', reputation: 1234 });
    const mockUser = { id: '0' } as User;
    interaction.member!.user.id = '1';
    interaction.options.getUser.mockReturnValueOnce(mockUser);
    interaction.options.getInteger.mockReturnValueOnce(1234);
    interaction.guild!.members.cache.get.mockImplementation((key) => {
      return { displayName: `test${key}` } as GuildMember;
    });

    await setReputation(interaction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("test1 just set test0's rep to 1234.\ntest0 → 1234 reps");
  });
});
