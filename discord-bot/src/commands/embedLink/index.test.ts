import { Collection, Webhook } from 'discord.js';
import faker from 'faker';
import embedLink from '.';

const webhookSendMock = jest.fn(() => {});
const msgDeleteMock = jest.fn(() => {});
const fakeHook: any = {
  name: 'VAIT-Hook',
  channelID: '123',
  send: webhookSendMock,
};
const fakeWebhooks = new Collection<string, Webhook>();
fakeWebhooks.set('0', fakeHook);

describe('Embed link test', () => {
  it('Should return a message with embeded message from the URL', async () => {
    const mockedChannel: any = { id: 345 };
    const mockedFetchedMsg: any = {
      author: faker.lorem.words(5),
      createdTimestamp: 1235123123,
      content: faker.lorem.words(25),
      id: 678,
    };
    const mockMsg: any = {
      content: 'https://discord.com/channels/836907335263060028/345/678',
      author: {
        bot: false,
        avatarURL: () => jest.fn(() => {}),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
        messages: {
          fetch: async () => mockedFetchedMsg,
        },
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

  it('Should create a webhook if nothing found', async () => {
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
