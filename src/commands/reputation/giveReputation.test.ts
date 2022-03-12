import { Collection, User } from 'discord.js';
import { giveReputation } from './giveReputation';
import { getOrCreateUser, updateRep } from './_helpers';

jest.mock('./_helpers');
const mockCreateUpdateUser = jest.mocked(getOrCreateUser);
const mockUpdateRep = jest.mocked(updateRep);

const replyMock = jest.fn(() => {});
const sendMock = jest.fn(() => {});

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

  it('should do nothing if user mention no one', async () => {
    const mockUsers = new Collection<string, User>();

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

  it('should do nothing if only bot is mentioned', async () => {
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

  it('should send reject message if user mention themselves', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);

    const mockMsg: any = {
      content: 'thank',
      reply: replyMock,
      mentions: {
        users: mockUsers,
      },
      channel: { send: sendMock },
      author: {
        id: '0',
      },
    };
    await giveReputation(mockMsg);

    expect(replyMock).toHaveBeenCalled();
  });

  it('should call reply and add rep if user mention another user', async () => {
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
      channel: { send: sendMock },
      author: {
        id: '1',
      },
    };
    await giveReputation(mockMsg);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateRep).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(0);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('should give rep multiple times if mentions more than one user', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0', bot: false } as User);
    mockUsers.set('1', { id: '1', bot: true } as User);
    mockUsers.set('2', { id: '2', bot: false } as User);
    mockUsers.set('3', { id: '3', bot: false } as User);
    mockCreateUpdateUser
      .mockResolvedValueOnce({ id: '2', reputation: 0 })
      .mockResolvedValueOnce({ id: '3', reputation: 0 });
    mockUpdateRep
      .mockResolvedValueOnce({ id: '2', reputation: 0 })
      .mockResolvedValueOnce({ id: '3', reputation: 0 });

    const mockMsg: any = {
      content: 'thank',
      mentions: {
        users: mockUsers,
      },
      author: {
        id: '0',
        bot: false,
      },
      channel: {
        send: sendMock,
      },
    };

    await giveReputation(mockMsg);

    expect(sendMock).toHaveBeenCalledTimes(2);
  });
});
