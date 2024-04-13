import { type ChatInputCommandInteraction, Collection, type Message, type User } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { giveRepSlashCommand, thankUserInMessage } from './give-reputation';
import { getOrCreateUser, updateRep } from './utils';

vi.mock('./utils');
const mockCreateUpdateUser = vi.mocked(getOrCreateUser);
const mockUpdateRep = vi.mocked(updateRep);

const mockMessage = mockDeep<Message>();
const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('Thank user in a message', () => {
  beforeEach(() => {
    mockReset(mockMessage);
    mockMessage.content = 'thank';
    mockMessage.author.id = '0';
    mockMessage.author.bot = false;
  });

  it('should do nothing if bot is saying the keywords', async () => {
    mockMessage.author.bot = true;

    await thankUserInMessage(mockMessage);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(mockMessage.reply).not.toHaveBeenCalled();
  });

  it('should do nothing if user mention no one', async () => {
    const mockUsers = new Collection<string, User>();
    mockMessage.mentions.users = mockUsers as typeof mockMessage.mentions.users;

    await thankUserInMessage(mockMessage);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(mockMessage.reply).not.toHaveBeenCalled();
  });

  it('should do nothing if only bot is mentioned', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1', bot: true } as User);
    mockMessage.mentions.users = mockUsers as typeof mockMessage.mentions.users;

    await thankUserInMessage(mockMessage);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(mockMessage.reply).not.toHaveBeenCalled();
  });

  it('should do nothing message if user mention themself', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    mockMessage.mentions.users = mockUsers as typeof mockMessage.mentions.users;

    await thankUserInMessage(mockMessage);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(mockMessage.reply).not.toHaveBeenCalled();
  });

  it('should call reply and add rep if user mention another user', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1' } as User);
    mockMessage.mentions.users = mockUsers as typeof mockMessage.mentions.users;
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '1', reputation: 0 }).mockResolvedValueOnce({ id: '2', reputation: 0 });
    mockUpdateRep.mockResolvedValueOnce({ id: '1', reputation: 1 });

    await thankUserInMessage(mockMessage);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledOnce();
    expect(mockMessage.reply).not.toHaveBeenCalled();
    expect(mockMessage.channel.send).toHaveBeenCalledOnce();
  });

  it('should give rep multiple times if mentions more than one user', async () => {
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0', bot: false } as User);
    mockUsers.set('1', { id: '1', bot: true } as User);
    mockUsers.set('2', { id: '2', bot: false } as User);
    mockUsers.set('3', { id: '3', bot: false } as User);
    mockMessage.mentions.users = mockUsers as typeof mockMessage.mentions.users;
    mockCreateUpdateUser
      .mockResolvedValueOnce({ id: '0', reputation: 0 })
      .mockResolvedValueOnce({ id: '2', reputation: 0 })
      .mockResolvedValueOnce({ id: '0', reputation: 0 })
      .mockResolvedValueOnce({ id: '3', reputation: 0 });
    mockUpdateRep.mockResolvedValueOnce({ id: '2', reputation: 0 }).mockResolvedValueOnce({ id: '3', reputation: 0 });

    await thankUserInMessage(mockMessage);

    expect(mockMessage.channel.send).toHaveBeenCalledOnce();
  });
});

describe('Give rep slash command', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('should send reject message if user mention themself', async () => {
    mockInteraction.options.getUser.mockReturnValueOnce({ id: '0' } as User);
    mockInteraction.member!.user.id = '0';

    await giveRepSlashCommand(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('You cannot give rep to a bot or yourself');
  });

  it('should send reject message if user mention a bot', async () => {
    const mockUser = { id: '1', bot: true } as User;
    mockInteraction.options.getUser.mockReturnValueOnce(mockUser);

    await giveRepSlashCommand(mockInteraction);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('You cannot give rep to a bot or yourself');
  });

  it('should call reply and add rep if user mention another user', async () => {
    const mockUser = { id: '1' } as User;
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '0', reputation: 0 }).mockResolvedValueOnce({ id: '1', reputation: 0 });
    mockUpdateRep.mockResolvedValueOnce({ id: '1', reputation: 1 });
    mockInteraction.options.getUser.mockReturnValueOnce(mockUser);

    await giveRepSlashCommand(mockInteraction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });
});
