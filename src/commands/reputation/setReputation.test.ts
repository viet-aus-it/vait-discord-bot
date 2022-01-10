import { Collection, User } from 'discord.js';
import { setReputation } from './setReputation';
import { getOrCreateUser, updateRep } from './_helpers';
import { isMessageSentFromAdmin } from '../../utils';

jest.mock('./_helpers');
const mockCreateUpdateUser = jest.mocked(getOrCreateUser);
const mockUpdateRep = jest.mocked(updateRep);

jest.mock('../../utils/isMessageSentFromAdmin');
const mockIsMessageSentFromAdmin = jest.mocked(isMessageSentFromAdmin);

const sendMock = jest.fn(() => {});

describe('setRep', () => {
  beforeAll(() => {
    mockIsMessageSentFromAdmin.mockReturnValue(true);
  });

  it('should do nothing if bot is saying the keywords', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '2' } as User);

    const mockMsg: any = {
      content: '-setrep',
      channel: { send: sendMock },
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '0',
        bot: true,
      },
      guild: {},
      member: {},
    };

    await setReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should reply with an error message if the user is not an admin', async () => {
    mockIsMessageSentFromAdmin.mockReturnValueOnce(false);
    const mockMsg: any = {
      content: '-setrep',
      channel: { send: sendMock },
      mentions: {},
      author: {
        id: '0',
        bot: false,
      },
      guild: {},
      member: {},
    };

    await setReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledWith(
      "You don't have enough permission to run this command."
    );
  });

  it('should do nothing if mentions more than one user', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    mockUsers.set('1', { id: '1' } as User);

    const mockMsg: any = {
      content: '-setrep',
      channel: { send: sendMock },
      mentions: {
        users: mockUsers,
      },
      author: {
        bot: false,
      },
      guild: {},
      member: {},
    };

    await setReputation(mockMsg);

    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should do nothing if user mention no one', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);

    const mockMsg: any = {
      content: '-setrep',
      channel: { send: sendMock },
      mentions: {
        users: {
          first: () => undefined,
          size: 1,
        },
      },
      author: {
        id: '5',
        bot: false,
      },
      guild: {},
      member: {},
    };

    await setReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should do nothing if bot is mentioned', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1', bot: true } as User);

    const mockMsg: any = {
      content: '-setrep',
      channel: { send: sendMock },
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '5',
        bot: false,
      },
      guild: {},
      member: {},
    };

    await setReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should do nothing if the message is in the wrong format', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '0', reputation: 0 });

    const mockMsg: any = {
      content: '-setrep 1 2 3',
      channel: { send: sendMock },
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '1',
      },
      guild: {},
      member: {},
    };
    await setReputation(mockMsg);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledWith(
      'Wrong format. The correct format is `setRep @username repNumber`'
    );
  });

  it('should send reply if rep value is not a number', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '0', reputation: 0 });

    const mockMsg: any = {
      content: '-setrep asdf asdf',
      channel: { send: sendMock },
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '1',
      },
      guild: {},
      member: {},
    };
    await setReputation(mockMsg);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledWith(
      "Invalid, cannot set the user's rep to this value"
    );
  });

  it('should send reply if rep value is negative', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '0', reputation: 0 });

    const mockMsg: any = {
      content: '-setrep asdf -1000',
      channel: { send: sendMock },
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '1',
      },
      guild: {},
      member: {},
    };
    await setReputation(mockMsg);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledWith(
      "Invalid, cannot set the user's rep to this value"
    );
  });

  it('Should call reply', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0', username: 'testUser' } as User);
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '0', reputation: 1 });
    mockUpdateRep.mockResolvedValueOnce({ id: '0', reputation: 1234 });

    const mockMsg: any = {
      content: '-setrep testUser 1234',
      channel: { send: sendMock },
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '1',
        username: 'admin',
      },
      guild: {},
      member: {},
    };
    await setReputation(mockMsg);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateRep).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      "admin just set testUser's rep to 1234. \ntestUser's current rep: 1234"
    );
  });
});
