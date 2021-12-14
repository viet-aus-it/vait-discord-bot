import { Collection, User } from 'discord.js';
import { mocked } from 'jest-mock';
import { takeReputation } from './takeReputation';
import { getOrCreateUser, updateRep } from './_helpers';
import { isMessageSentFromAdmin } from '../../utils';

jest.mock('./_helpers');
const mockCreateUpdateUser = mocked(getOrCreateUser);
const mockUpdateRep = mocked(updateRep);

jest.mock('../../utils/isMessageSentFromAdmin');
const mockIsMessageSentFromAdmin = mocked(isMessageSentFromAdmin);

const sendMock = jest.fn(() => {});

describe('takeRep', () => {
  beforeAll(() => {
    mockIsMessageSentFromAdmin.mockReturnValue(true);
  });

  it('should do nothing if bot is saying the keywords', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '2' } as User);

    const mockMsg: any = {
      content: '-takerep',
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

    await takeReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should reply with an error message if the user is not an admin', async () => {
    mockIsMessageSentFromAdmin.mockReturnValueOnce(false);
    const mockMsg: any = {
      content: '-takerep',
      channel: { send: sendMock },
      mentions: {},
      author: {
        id: '0',
        bot: false,
      },
      guild: {},
      member: {},
    };

    await takeReputation(mockMsg);
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
      content: '-takerep',
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

    await takeReputation(mockMsg);

    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should do nothing if user mention no one', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);

    const mockMsg: any = {
      content: '-takerep',
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

    await takeReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should do nothing if bot is mentioned', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1', bot: true } as User);

    const mockMsg: any = {
      content: '-takerep',
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

    await takeReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should send a message if the user has 0 rep', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0', username: 'testUser' } as User);
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '0', reputation: 0 });

    const mockMsg: any = {
      content: '-takerep',
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
    await takeReputation(mockMsg);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledWith('testUser currently has 0 rep');
  });

  it('Should call reply', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0', username: 'testUser' } as User);
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '0', reputation: 1 });
    mockUpdateRep.mockResolvedValueOnce({ id: '0', reputation: 0 });

    const mockMsg: any = {
      content: '-takerep',
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
    await takeReputation(mockMsg);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateRep).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      "admin took from testUser 1 rep. \ntestUser's current rep: 0"
    );
  });
});
