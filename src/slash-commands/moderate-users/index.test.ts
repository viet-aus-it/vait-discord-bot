import { type APIRole, Collection, type GuildTextBasedChannel, type Role, type ThreadMember, type ThreadMemberManager } from 'discord.js';
import { describe, expect } from 'vitest';
import type { DeepMockProxy } from 'vitest-mock-extended';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { removeUserByRole } from '.';

describe('Remove users who have the role', () => {
  chatInputCommandInteractionTest('should reply with an error message if the command is not executed in a thread', async ({ interaction }) => {
    interaction.channel?.isThread.mockReturnValueOnce(false);

    await removeUserByRole(interaction);

    expect(interaction.reply).toHaveBeenCalledWith("You can't remove all users from entire channel. This command only works in a thread.");
  });

  chatInputCommandInteractionTest('should remove all users from the thread with the matching role', async ({ interaction }) => {
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

    interaction.channel?.isTextBased.mockReturnValueOnce(true);
    interaction.channel?.isThread.mockReturnValueOnce(true);
    ((interaction.channel as GuildTextBasedChannel).members as DeepMockProxy<ThreadMemberManager>).fetch.mockResolvedValueOnce(mockMembers);
    interaction.options.getRole.mockReturnValueOnce({
      id: 'role-id',
      name: 'name',
    } as APIRole);

    await removeUserByRole(interaction);

    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalled();
  });
});
