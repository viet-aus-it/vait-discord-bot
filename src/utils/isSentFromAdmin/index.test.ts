import { Collection, Role } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { isAdmin, isModerator } from '.';

describe('isModerator', () => {
  it('Should return false if message does not contain member information', () => {
    const fakeMember = null;
    const output = isModerator(fakeMember);
    expect(output).toBeFalsy();
  });

  it('Should return false for user without roles', () => {
    const fakeMember: any = {
      roles: {
        cache: {
          some: () => undefined,
        },
      },
    };
    const output = isModerator(fakeMember);
    expect(output).toBeFalsy();
  });

  it('Should return true for user with moderator role', () => {
    const fakeRole: any = { name: 'Moderator' };
    const fakeRoles = new Collection<string, Role>();
    fakeRoles.set('1', fakeRole);
    const fakeMember: any = {
      roles: {
        cache: fakeRoles,
      },
    };
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
    const fakeMember: any = { permissions: { has: () => false } };
    const output = isAdmin(fakeMember);
    expect(output).toBeFalsy();
  });
});
