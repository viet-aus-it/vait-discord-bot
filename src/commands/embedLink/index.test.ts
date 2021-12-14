import { Collection, GuildChannel, Webhook } from 'discord.js';
import { mocked } from 'jest-mock';
import mockConsole from 'jest-mock-console';
import faker from 'faker';
import embedLink from '.';
import { fetchMessageObjectById } from '../../utils';

const webhookSendMock = jest.fn(() => {});
const msgDeleteMock = jest.fn(() => {});
const fakeHook: any = {
  name: 'VAIT-Hook',
  channelID: '123',
  send: webhookSendMock,
};
const fakeWebhooks = new Collection<string, Webhook>();
fakeWebhooks.set('0', fakeHook);
jest.mock('../../utils/messageFetcher');
const mockedMessageFetch = mocked(fetchMessageObjectById);

describe('Embed link test', () => {
  it("Should return if guild isn't found", async () => {
    const mockMsg: any = {
      content:
        'https://discord.com/channels/836907335263060028/844572466517245954/844667107581100073',
      author: {
        bot: false,
        avatarURL: jest.fn(() => {}),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
        id: '123',
      },
      delete: msgDeleteMock,
    };
    await embedLink(mockMsg);
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should return if author is a bot', async () => {
    const mockMsg: any = {
      content:
        'https://discord.com/channels/836907335263060028/844572466517245954/844667107581100073',
      author: {
        bot: true,
        avatarURL: jest.fn(() => {}),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
        id: '123',
      },
      delete: msgDeleteMock,
      guild: {},
    };
    await embedLink(mockMsg);
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it("Should create a webhook if there's none existing in the current channel", async () => {
    const createHookMock = jest.fn(() => {});
    const mockMsg: any = {
      content: `https://google.com.au`,
      author: { bot: false },
      channel: {
        fetchWebhooks: async () => new Collection<string, Webhook>(),
        createWebhook: createHookMock,
      },
      delete: msgDeleteMock,
      guild: {},
    };

    await embedLink(mockMsg);
    expect(createHookMock).toHaveBeenCalledTimes(1);
  });

  it('Should return if link is not from discord', async () => {
    const mockMsg: any = {
      content: 'https://google.com',
      author: {
        bot: false,
        avatarURL: jest.fn(() => {}),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
        id: '123',
      },
      delete: msgDeleteMock,
      guild: {},
    };
    await embedLink(mockMsg);
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should return when the source channel does not exist anymore', async () => {
    const mockedFetchedMsg: any = {
      author: {
        username: faker.lorem.words(5),
        avatarURL: jest.fn(),
      },
      createdTimestamp: 1235123123,
      content: faker.lorem.words(25),
      id: 678,
    };
    mockedMessageFetch.mockReturnValue(mockedFetchedMsg);
    const guildChannels = new Collection<string, GuildChannel>();
    const mockMsg: any = {
      content: 'https://discord.com/channels/836907335263060028/345/678',
      author: {
        bot: false,
        avatarURL: jest.fn(),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      guild: {
        channels: {
          cache: guildChannels,
        },
      },
      delete: msgDeleteMock,
    };
    await embedLink(mockMsg);
    expect(mockedMessageFetch).not.toHaveBeenCalled();
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should return when the original message does not exist anymore', async () => {
    mockedMessageFetch.mockReturnValueOnce(Promise.resolve(undefined));
    const mockedChannel: any = {
      id: '345',
      messages: {
        fetch: mockedMessageFetch,
      },
    };
    const guildChannels = new Collection<string, GuildChannel>();
    guildChannels.set('345', mockedChannel);
    const mockMsg: any = {
      content: 'https://discord.com/channels/836907335263060028/345/678',
      author: {
        bot: false,
        avatarURL: jest.fn(),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      guild: {
        channels: {
          cache: guildChannels,
        },
      },
      delete: msgDeleteMock,
    };
    await embedLink(mockMsg);

    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should send a message with embeded message from the URL', async () => {
    const mockedFetchedMsg: any = {
      author: {
        username: faker.lorem.words(5),
        avatarURL: jest.fn(),
      },
      createdTimestamp: 1235123123,
      content: faker.lorem.words(25),
      id: 678,
    };
    mockedMessageFetch.mockReturnValue(mockedFetchedMsg);
    const mockedChannel: any = {
      id: '345',
      messages: {
        fetch: mockedMessageFetch,
      },
    };
    const guildChannels = new Collection<string, GuildChannel>();
    guildChannels.set('345', mockedChannel);
    const mockMsg: any = {
      content: 'https://discord.com/channels/836907335263060028/345/678',
      author: {
        bot: false,
        avatarURL: jest.fn(),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      guild: {
        channels: {
          cache: guildChannels,
        },
      },
      delete: msgDeleteMock,
    };
    await embedLink(mockMsg);
    expect(mockedMessageFetch).toHaveBeenCalledTimes(1);
    expect(webhookSendMock).toHaveBeenCalledTimes(1);
    expect(msgDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('Should send a message with embeded message from the URL, even if author avatar is undefined', async () => {
    const mockedFetchedMsg: any = {
      author: {
        username: faker.lorem.words(5),
        avatarURL: () => undefined,
      },
      createdTimestamp: 1235123123,
      content: faker.lorem.words(25),
      id: 678,
    };
    mockedMessageFetch.mockReturnValue(mockedFetchedMsg);
    const mockedChannel: any = {
      id: '345',
      messages: {
        fetch: mockedMessageFetch,
      },
    };
    const guildChannels = new Collection<string, GuildChannel>();
    guildChannels.set('345', mockedChannel);
    const mockMsg: any = {
      content: 'https://discord.com/channels/836907335263060028/345/678',
      author: {
        bot: false,
        username: faker.lorem.words(1),
        avatarURL: () => undefined,
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      guild: {
        channels: {
          cache: guildChannels,
        },
      },
      delete: msgDeleteMock,
    };
    await embedLink(mockMsg);
    expect(mockedMessageFetch).toHaveBeenCalledTimes(1);
    expect(webhookSendMock).toHaveBeenCalledTimes(1);
    expect(msgDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('Should handle error with console if message cannot be sent', async () => {
    const fakeFailHook: any = {
      ...fakeHook,
      send: jest.fn(() => Promise.reject(new Error('Synthetic Error'))),
    };
    const fakeHooks = new Collection<string, Webhook>();
    fakeHooks.set('0', fakeFailHook);
    const mockedFetchedMsg: any = {
      author: {
        username: faker.lorem.words(5),
        avatarURL: jest.fn(),
      },
      createdTimestamp: 1235123123,
      content: faker.lorem.words(25),
      id: 678,
    };
    mockedMessageFetch.mockReturnValue(mockedFetchedMsg);
    const mockedChannel: any = {
      id: '345',
      messages: {
        fetch: mockedMessageFetch,
      },
    };
    const guildChannels = new Collection<string, GuildChannel>();
    guildChannels.set('345', mockedChannel);
    const mockMsg: any = {
      content: 'https://discord.com/channels/836907335263060028/345/678',
      author: {
        bot: false,
        avatarURL: jest.fn(),
      },
      channel: {
        fetchWebhooks: async () => fakeHooks,
        createWebhook: async () => fakeFailHook,
      },
      guild: {
        channels: {
          cache: guildChannels,
        },
      },
      delete: msgDeleteMock,
    };
    mockConsole();
    await embedLink(mockMsg);
    expect(mockedMessageFetch).toHaveBeenCalledTimes(1);
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });
});
