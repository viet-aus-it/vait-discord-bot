import { Collection, User } from 'discord.js';
import { mocked } from 'ts-jest/utils';
import { giveReputation } from './giveReputation';
import { getOrCreateUser, updateRep } from './_helpers';

jest.mock('./_helpers');
const mockCreateUpdateUser = mocked(getOrCreateUser);
const mockUpdateRep = mocked(updateRep);

const replyMock = jest.fn(() => {});

describe('giveRep', () => {
  it('should do nothing if bot is saying the keywords', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '2' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '0',
        bot: true,
      },
    };

    await giveReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('should do nothing if mentions more than one user', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    mockUsers.set('1', { id: '1' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      author: {
        bot: false,
      },
    };

    await giveReputation(mockMsg);

    expect(replyMock).not.toHaveBeenCalled();
  });

  it('should do nothing if user mention no one', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
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
    };

    await giveReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('should do nothing if bot is mentioned', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1', bot: true } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '5',
        bot: false,
      },
    };

    await giveReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('should send reject message if user mention himself', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '0',
        bot: false,
      },
    };

    await giveReputation(mockMsg);

    expect(replyMock).toHaveBeenCalled();
  });

  it('should call reply', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '0', reputation: 0 });
    mockUpdateRep.mockResolvedValueOnce({ id: '0', reputation: 1 });

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      channel: { send: replyMock },
      author: {
        id: '1',
      },
    };
    await giveReputation(mockMsg);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateRep).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});
