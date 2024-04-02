import { Collection, type GuildMember, type Role } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { isAdmin, isModerator } from '.';

describe('isModerator', () => {
  it('Should return false if message does not contain member information', () => {
    const output = isModerator(null);
    expect(output).toBeFalsy();
  });

  it('Should return false for user without roles', () => {
    const fakeMember = {
      roles: {
        cache: new Collection<string, Role>(),
      },
    } as GuildMember;
    const output = isModerator(fakeMember);
    expect(output).toBeFalsy();
  });

  it('Should return true for user with moderator role', () => {
    const fakeRole = { name: 'Moderator' } as Role;
    const fakeRoles = new Collection<string, Role>();
    fakeRoles.set('1', fakeRole);
    const fakeMember = {
      roles: {
        cache: fakeRoles,
      },
    } as GuildMember;
    const output = isModerator(fakeMember);
    expect(output).toBeTruthy();
  });
});

describe('isAdmin', () => {
  it('Should return false if message does not contain member information', () => {
    const fakeMember = null;
    const output = isAdmin(fakeMember);
    expect(output).toBeFalsy();
  });

  it('Should return false for user without permissions', () => {
    const fakeMember = { permissions: { has: () => false } } as unknown as GuildMember;
    const output = isAdmin(fakeMember);
    expect(output).toBeFalsy();
  });
});
