import { Collection, type User } from 'discord.js';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { giveRepSlashCommand, thankUserInMessage } from './give-reputation';
import { getOrCreateUser, updateRep } from './utils';

vi.mock('./utils');
const mockCreateUpdateUser = vi.mocked(getOrCreateUser);
const mockUpdateRep = vi.mocked(updateRep);

describe('Thank user in a message', () => {
  chatInputCommandInteractionTest('should do nothing if bot is saying the keywords', async ({ message }) => {
    message.content = 'thank';
    message.author.id = '0';
    message.author.bot = true;

    await thankUserInMessage(message);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(message.reply).not.toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should do nothing if user mention no one', async ({ message }) => {
    message.content = 'thank';
    message.author.id = '0';
    message.author.bot = false;
    const mockUsers = new Collection<string, User>();
    message.mentions.users = mockUsers as typeof message.mentions.users;

    await thankUserInMessage(message);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(message.reply).not.toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should do nothing if only bot is mentioned', async ({ message }) => {
    message.content = 'thank';
    message.author.id = '0';
    message.author.bot = false;
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1', bot: true } as User);
    message.mentions.users = mockUsers as typeof message.mentions.users;

    await thankUserInMessage(message);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(message.reply).not.toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should do nothing message if user mention themself', async ({ message }) => {
    message.content = 'thank';
    message.author.id = '0';
    message.author.bot = false;
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0' } as User);
    message.mentions.users = mockUsers as typeof message.mentions.users;

    await thankUserInMessage(message);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalled();
    expect(message.reply).not.toHaveBeenCalled();
  });

  chatInputCommandInteractionTest('should call reply and add rep if user mention another user', async ({ message }) => {
    message.content = 'thank';
    message.author.id = '0';
    message.author.bot = false;
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '1' } as User);
    message.mentions.users = mockUsers as typeof message.mentions.users;
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '1', reputation: 0 }).mockResolvedValueOnce({ id: '2', reputation: 0 });
    mockUpdateRep.mockResolvedValueOnce({ id: '1', reputation: 1 });

    await thankUserInMessage(message);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledOnce();
    expect(message.reply).not.toHaveBeenCalled();
    expect(message.channel.send).toHaveBeenCalledOnce();
  });

  chatInputCommandInteractionTest('should give rep multiple times if mentions more than one user', async ({ message }) => {
    message.content = 'thank';
    message.author.id = '0';
    message.author.bot = false;
    const mockUsers = new Collection<string, User>();
    mockUsers.set('0', { id: '0', bot: false } as User);
    mockUsers.set('1', { id: '1', bot: true } as User);
    mockUsers.set('2', { id: '2', bot: false } as User);
    mockUsers.set('3', { id: '3', bot: false } as User);
    message.mentions.users = mockUsers as typeof message.mentions.users;
    mockCreateUpdateUser
      .mockResolvedValueOnce({ id: '0', reputation: 0 })
      .mockResolvedValueOnce({ id: '2', reputation: 0 })
      .mockResolvedValueOnce({ id: '0', reputation: 0 })
      .mockResolvedValueOnce({ id: '3', reputation: 0 });
    mockUpdateRep.mockResolvedValueOnce({ id: '2', reputation: 0 }).mockResolvedValueOnce({ id: '3', reputation: 0 });

    await thankUserInMessage(message);

    expect(message.channel.send).toHaveBeenCalledOnce();
  });
});

describe('Give rep slash command', () => {
  chatInputCommandInteractionTest('should send reject message if user mention themself', async ({ interaction }) => {
    interaction.options.getUser.mockReturnValueOnce({ id: '0' } as User);
    interaction.member!.user.id = '0';

    await giveRepSlashCommand(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('You cannot give rep to a bot or yourself');
  });

  chatInputCommandInteractionTest('should send reject message if user mention a bot', async ({ interaction }) => {
    const mockUser = { id: '1', bot: true } as User;
    interaction.options.getUser.mockReturnValueOnce(mockUser);

    await giveRepSlashCommand(interaction);

    expect(mockCreateUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateRep).not.toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('You cannot give rep to a bot or yourself');
  });

  chatInputCommandInteractionTest('should call reply and add rep if user mention another user', async ({ interaction }) => {
    const mockUser = { id: '1' } as User;
    mockCreateUpdateUser.mockResolvedValueOnce({ id: '0', reputation: 0 }).mockResolvedValueOnce({ id: '1', reputation: 0 });
    mockUpdateRep.mockResolvedValueOnce({ id: '1', reputation: 1 });
    interaction.options.getUser.mockReturnValueOnce(mockUser);

    await giveRepSlashCommand(interaction);

    expect(mockCreateUpdateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateRep).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
  });
});
