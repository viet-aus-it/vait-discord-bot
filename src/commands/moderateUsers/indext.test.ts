import { it, describe, expect } from 'vitest';
import { removeUserByRole } from '.';
import { isAdmin, isModerator } from '../../utils';

vi.mock('../../utils/isSentFromAdmin');
const mockIsSentFromAdmin = vi.mocked(isAdmin);
vi.mock('../../utils/isSentFromModerator');
const mockIsSentFromModerator = vi.mocked(isModerator);
const replyMock = vi.fn(() => {});

describe('Remove users who have the role', () => {
  beforeAll(() => {
    mockIsSentFromAdmin.mockReturnValue(true);
    mockIsSentFromModerator.mockReturnValue(true);
  });

  it('should reply with an error message if the user is not an admin or a moderator', async () => {
    mockIsSentFromAdmin.mockReturnValueOnce(false);
    mockIsSentFromModerator.mockReturnValueOnce(false);
    const mockInteraction: any = {
      reply: replyMock,
    };

    await removeUserByRole(mockInteraction);
    expect(replyMock).toHaveBeenCalledWith(
      "You don't have enough permission to run this command."
    );
  });

  it('should reply with an error message if the command is not executed in a thread', async () => {
    const interaction: any = {
      channel: {
        isThread: false,
      },
      reply: replyMock,
    };

    await removeUserByRole(interaction);
    expect(replyMock).toHaveBeenCalledWith(
      "You can't remove all users with role from entire channel. This command only works in a thread."
    );
  });

  it('should remove all users from the thread with the matching role', async () => {
    const interaction: any = {
      channel: {
        isThread: true,
      },
      members: [
        {
          id: 'user1-id',
          guildMember: {
            roles: {
              cache: [
                {
                  id: 'role-id',
                  name: 'name',
                },
              ],
            },
          },
        },
        {
          id: 'user3-id',
          guildMember: {
            roles: {
              cache: [
                {
                  id: 'role-id',
                  name: 'name',
                },
              ],
            },
          },
        },
        {
          id: 'user3-id',
          guildMember: {
            roles: {
              cache: [
                {
                  id: 'role-id',
                  name: 'name',
                },
              ],
            },
          },
        },
      ],
      options: {
        getRole: vi.fn(() => 'name'),
      },
    };
    await removeUserByRole(interaction);
    expect(replyMock).toHaveBeenCalledOnce();
  });
});
