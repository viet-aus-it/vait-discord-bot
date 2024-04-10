import { type APIRole, type ChatInputCommandInteraction, Collection, type Role, type ThreadMember, type ThreadMemberManager } from 'discord.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { type DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended';
import { removeUserByRole } from '.';
import { isAdmin, isModerator } from '../../utils/permission';

vi.mock('../../utils/permission');
const mockIsSentFromAdmin = vi.mocked(isAdmin);
const mockIsSentFromModerator = vi.mocked(isModerator);

const mockInteraction = mockDeep<ChatInputCommandInteraction<'raw'>>();

describe('Remove users who have the role', () => {
  beforeAll(() => {
    mockIsSentFromAdmin.mockReturnValue(true);
    mockIsSentFromModerator.mockReturnValue(true);
  });

  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('should reply with an error message if the user is not an admin or a moderator', async () => {
    mockIsSentFromAdmin.mockReturnValueOnce(false);
    mockIsSentFromModerator.mockReturnValueOnce(false);

    await removeUserByRole(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith("You don't have enough permission to run this command.");
  });

  it('should reply with an error message if the command is not executed in a thread', async () => {
    mockInteraction.channel?.isThread.mockReturnValueOnce(false);

    await removeUserByRole(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith("You can't remove all users from entire channel. This command only works in a thread.");
  });

  it('should remove all users from the thread with the matching role', async () => {
    const fakeRoles = new Collection<string, Role>();
    fakeRoles.set('1', { id: 'role-id', name: 'name' } as Role);
    const mockMembers = new Collection<string, ThreadMember>();
    mockMembers.set('1', {
      id: 'user1-id',
      guildMember: {
        roles: {
          cache: fakeRoles,
        },
      },
    } as ThreadMember);
    mockMembers.set('2', {
      id: 'user2-id',
      guildMember: {
        roles: {
          cache: fakeRoles,
        },
      },
    } as ThreadMember);
    mockMembers.set('3', {
      id: 'user3-id',
      guildMember: {
        roles: {
          cache: fakeRoles,
        },
      },
    } as ThreadMember);

    mockInteraction.channel?.isTextBased.mockReturnValueOnce(true);
    mockInteraction.channel?.isThread.mockReturnValueOnce(true);
    (mockInteraction.channel?.members as DeepMockProxy<ThreadMemberManager>).fetch.mockResolvedValueOnce(mockMembers);
    mockInteraction.options.getRole.mockReturnValueOnce({
      id: 'role-id',
      name: 'name',
    } as APIRole);

    await removeUserByRole(mockInteraction);

    expect(mockInteraction.deferReply).toHaveBeenCalled();
    expect(mockInteraction.editReply).toHaveBeenCalled();
  });
});
