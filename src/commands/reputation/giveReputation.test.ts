import { Collection, User } from 'discord.js';
import { giveReputation } from './giveReputation';
import { getOrCreateUser, updateRep } from './_helpers';

jest.mock('./_helpers');
const mockCreateUpdateUser = jest.mocked(getOrCreateUser);
const mockUpdateRep = jest.mocked(updateRep);

const replyMock = jest.fn(() => {});
const sendMock = jest.fn(() => {});

const getMockMsg: any = (mockUsers: Collection<string, User>) => ({
  content: 'thank',
  reply: replyMock,
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
});

describe('giveRep', () => {
  it('should do nothing if bot is saying the keywords', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1' } as User);
    const mockMsg = getMockMsg(mockUsers);
    const botMsg = {
      ...mockMsg,
      author: {
        ...mockMsg.author,
        bot: true,
      },
    };

    await giveReputation(botMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('should do nothing if user mention no one', async () => {
    const mockUsers = new Collection<string, User>();
    const mockMsg = getMockMsg(mockUsers);

    await giveReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('should do nothing if only bot is mentioned', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1', bot: true } as User);
    const mockMsg = getMockMsg(mockUsers);

    await giveReputation(mockMsg);
    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('should send reject message if user mention themself', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    const mockMsg = getMockMsg(mockUsers);

    await giveReputation(mockMsg);

    expect(replyMock).toHaveBeenCalled();
  });

  it('should call reply and add rep if user mention another user', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1' } as User);
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '1', reputation: 0 });
    mockUpdateRep.mockResolvedValueOnce({ id: '1', reputation: 1 });

    const mockMsg = getMockMsg(mockUsers);
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
    const mockMsg = getMockMsg(mockUsers);

    await giveReputation(mockMsg);

    expect(sendMock).toHaveBeenCalledTimes(2);
  });
});
