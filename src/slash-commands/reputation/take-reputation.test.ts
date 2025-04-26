import type { GuildMember, User } from 'discord.js';
import { beforeAll, describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { isAdmin } from '../../utils/permission';
import { takeReputation } from './take-reputation';
import { getOrCreateUser, updateRep } from './utils';

vi.mock('./utils');
const mockCreateUpdateUser = vi.mocked(getOrCreateUser);
const mockUpdateRep = vi.mocked(updateRep);

vi.mock('../../utils/permission');
const mockIsSentFromAdmin = vi.mocked(isAdmin);

describe('takeRep', () => {
  beforeAll(() => {
    mockIsSentFromAdmin.mockReturnValue(true);
  });

  chatInputCommandInteractionTest('should reply with an error message if the user is not an admin', async ({ interaction }) => {
    mockIsSentFromAdmin.mockReturnValueOnce(false);

    await takeReputation(interaction);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith("You don't have enough permission to run this command.");
  });

  chatInputCommandInteractionTest('should send a message if the user has 0 rep', async ({ interaction }) => {
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '1', reputation: 0 }).mockResolvedValueOnce({ id: '0', reputation: 0 });
    const mockUser = { id: '0' } as User;
    interaction.member!.user.id = '1';
    interaction.options.getUser.mockReturnValueOnce(mockUser);

    await takeReputation(interaction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith('<@0> currently has 0 rep');
  });

  chatInputCommandInteractionTest('Should call reply when user mentions another user', async ({ interaction }) => {
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '1', reputation: 10 }).mockResolvedValueOnce({ id: '0', reputation: 10 });
    mockUpdateRep.mockResolvedValueOnce({ id: '0', reputation: 0 });
    const mockUser = { id: '0' } as User;
    interaction.guild!.members.cache.get.mockImplementation((key) => {
      return { displayName: `test${key}` } as GuildMember;
    });
    interaction.member!.user.id = '1';
    interaction.options.getUser.mockReturnValueOnce(mockUser);

    await takeReputation(interaction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('test1 took 1 rep from test0.\ntest0 → 0 reps');
  });
});
