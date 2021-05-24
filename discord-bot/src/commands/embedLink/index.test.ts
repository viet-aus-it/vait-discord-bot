import { Collection, Webhook } from 'discord.js';
import faker from 'faker';
import embedLink from '.';
import { fetchMessageObjectById } from '../../utils/messageFetcher';

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
const mockedMessageFetch = fetchMessageObjectById as jest.MockedFunction<
  typeof fetchMessageObjectById
>;

describe('Embed link test', () => {
  it('Should return a message with embeded message from the URL', async () => {
    const mockedFetchedMsg: any = {
      author: {
        username: faker.lorem.words(5),
        avatarURL: () => jest.fn(),
      },
      createdTimestamp: 1235123123,
      content: faker.lorem.words(25),
      id: 678,
    };
    mockedMessageFetch.mockReturnValue(mockedFetchedMsg);
    const mockedChannel: any = {
      id: 345,
      messages: {
        fetch: mockedMessageFetch,
      },
    };
    const mockMsg: any = {
      content: 'https://discord.com/channels/836907335263060028/345/678',
      author: {
        bot: false,
        avatarURL: () => jest.fn(),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      guild: {
        channels: {
          cache: {
            find: () => mockedChannel,
          },
        },
      },
      delete: msgDeleteMock,
    };
    await embedLink(mockMsg);
    expect(mockedMessageFetch).toHaveBeenCalledTimes(1);
    expect(webhookSendMock).toHaveBeenCalledTimes(1);
    expect(msgDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('Should return if author is a bot', async () => {
    const mockMsg: any = {
      content:
        'https://discord.com/channels/836907335263060028/844572466517245954/844667107581100073',
      author: {
        bot: true,
        avatarURL: () => jest.fn(() => {}),
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

  it('Should return if link is not from discord', async () => {
    const mockMsg: any = {
      content: 'https://google.com',
      author: {
        bot: true,
        avatarURL: () => jest.fn(() => {}),
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
    };

    await embedLink(mockMsg);
    expect(createHookMock).toHaveBeenCalledTimes(1);
  });
});
