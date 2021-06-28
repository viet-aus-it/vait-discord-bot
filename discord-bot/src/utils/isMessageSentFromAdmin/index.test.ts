import { Guild, Collection, Role } from 'discord.js';
import { findAdminRoleByGuild, isMessageSentFromAdmin, SERVER_ID } from '.';

describe('findAdminRoleByGuild', () => {
  it('Should return correct admin role names for our main server', () => {
    const fakeGuild: any = { id: SERVER_ID.MAIN } as Guild;
    const output = findAdminRoleByGuild(fakeGuild);
    const expected = ['Admin', 'Moderator'];
    expect(output).toEqual(expected);
  });

  it('Should return correct admin role names for our test server', () => {
    const fakeGuild: any = { id: SERVER_ID.TEST } as Guild;
    const output = findAdminRoleByGuild(fakeGuild);
    const expected = ['VAIT Devs'];
    expect(output).toEqual(expected);
  });

  it('Should return blank for other cases', () => {
    const fakeGuild: any = { id: '1234567890' } as Guild;
    const output = findAdminRoleByGuild(fakeGuild);
    const expected: string[] = [];
    expect(output).toEqual(expected);
  });
});

describe('isMessageSentFromAdmin', () => {
  it('Should return false if message does not contain guild or member information', () => {
    const fakeGuild = null;
    const fakeMember = null;
    const output = isMessageSentFromAdmin({
      guild: fakeGuild,
      member: fakeMember,
    });
    expect(output).toBeFalsy();
  });

  it('Should return false for user without roles', () => {
    const fakeGuild: any = { id: '1234567890' } as Guild;
    const fakeMember: any = { roles: undefined };
    const output = isMessageSentFromAdmin({
      guild: fakeGuild,
      member: fakeMember,
    });
    expect(output).toBeFalsy();
  });

  describe('Should return correct admin status for our main server', () => {
    it('Should return true for user with Admin role', () => {
      const fakeGuild: any = { id: SERVER_ID.MAIN } as Guild;
      const fakeRole: any = { name: 'Admin' };
      const fakeRoles = new Collection<string, Role>();
      fakeRoles.set('1', fakeRole);
      const fakeMember: any = {
        roles: {
          cache: fakeRoles,
        },
      };
      const output = isMessageSentFromAdmin({
        guild: fakeGuild,
        member: fakeMember,
      });
      expect(output).toBeTruthy();
    });

    it('Should return true for user with Moderator role', () => {
      const fakeGuild: any = { id: SERVER_ID.MAIN } as Guild;
      const fakeRole: any = { name: 'Moderator' };
      const fakeRoles = new Collection<string, Role>();
      fakeRoles.set('1', fakeRole);
      const fakeMember: any = {
        roles: {
          cache: fakeRoles,
        },
      };
      const output = isMessageSentFromAdmin({
        guild: fakeGuild,
        member: fakeMember,
      });
      expect(output).toBeTruthy();
    });

    it('Should return false for user without admin role', () => {
      const fakeGuild: any = { id: SERVER_ID.MAIN } as Guild;
      const fakeRole: any = { name: 'ASDFRule' };
      const fakeRoles = new Collection<string, Role>();
      fakeRoles.set('1', fakeRole);
      const fakeMember: any = {
        roles: {
          cache: fakeRoles,
        },
      };
      const output = isMessageSentFromAdmin({
        guild: fakeGuild,
        member: fakeMember,
      });
      expect(output).toBeFalsy();
    });
  });

  describe('Should return correct admin status for our test server', () => {
    it('Should return true for user with VAIT Devs role', () => {
      const fakeGuild: any = { id: SERVER_ID.TEST } as Guild;
      const fakeRole: any = { name: 'VAIT Devs' };
      const fakeRoles = new Collection<string, Role>();
      fakeRoles.set('1', fakeRole);
      const fakeMember: any = {
        roles: {
          cache: fakeRoles,
        },
      };
      const output = isMessageSentFromAdmin({
        guild: fakeGuild,
        member: fakeMember,
      });
      expect(output).toBeTruthy();
    });

    it('Should return false for user without admin role', () => {
      const fakeGuild: any = { id: SERVER_ID.TEST } as Guild;
      const fakeRole: any = { name: 'ASDFRule' };
      const fakeRoles = new Collection<string, Role>();
      fakeRoles.set('1', fakeRole);
      const fakeMember: any = {
        roles: {
          cache: fakeRoles,
        },
      };
      const output = isMessageSentFromAdmin({
        guild: fakeGuild,
        member: fakeMember,
      });
      expect(output).toBeFalsy();
    });
  });
});
