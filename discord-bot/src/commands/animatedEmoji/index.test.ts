import { Collection, Webhook } from 'discord.js';
import animatedEmoji from '.';

const webhookSendMock = jest.fn(() => {});
const msgDeleteMock = jest.fn(() => {});
const fakeHook: any = {
  name: 'VAIT-Hook',
  channelID: '123',
  send: webhookSendMock,
};
const fakeAnimatedEmoji: any = {
  name: 'sadparrot',
  animated: true,
};

const fakeWebhooks = new Collection<string, Webhook>();
fakeWebhooks.set('0', fakeHook);

describe('animated emoji test', () => {
  it('Should return a message with embeded animated emoji', async () => {
    const mockMsg: any = {
      content: ':sadparrot:',
      author: {
        bot: false,
        avatarURL: () => jest.fn(() => {}),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
        id: '123',
      },
      guild: {
        emojis: {
          cache: {
            find: () => fakeAnimatedEmoji,
          },
        },
      },
      delete: msgDeleteMock,
    };
    await animatedEmoji(mockMsg);
    expect(webhookSendMock).toHaveBeenCalledTimes(1);
    expect(msgDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('Should return if author is a bot', async () => {
    const mockMsg: any = {
      content: `:sadparrot:`,
      author: { bot: true },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      guild: {
        emojis: {
          cache: {
            find: () => fakeAnimatedEmoji,
          },
        },
      },
      delete: msgDeleteMock,
    };

    await animatedEmoji(mockMsg);
    expect(webhookSendMock).not.toHaveBeenCalled();
  });

  it('Should return if author has nitro', async () => {
    const fetchHookMock = jest.fn(() => {});
    const mockMsg: any = {
      content: `Hello <a:sadparrot:123121233>`,
      author: { bot: false },
      channel: {
        fetchWebhooks: async () => fetchHookMock(),
        createWebhook: async () => fakeHook,
      },
      guild: {
        emojis: {
          cache: {
            find: () => fakeAnimatedEmoji,
          },
        },
      },
      delete: msgDeleteMock,
    };

    await animatedEmoji(mockMsg);
    expect(fetchHookMock).not.toHaveBeenCalled();
  });

  it('Should create a webhook if nothing found', async () => {
    const createHookMock = jest.fn(() => {});
    const mockMsg: any = {
      content: `:sadparrot:`,
      author: { bot: false },
      channel: {
        fetchWebhooks: async () => new Collection<string, Webhook>(),
        createWebhook: createHookMock,
      },
      guild: {
        emojis: {
          cache: {
            find: () => fakeAnimatedEmoji,
          },
        },
      },
      delete: msgDeleteMock,
    };

    await animatedEmoji(mockMsg);
    expect(createHookMock).toHaveBeenCalledTimes(1);
  });

  it('Should return if no matching emoji is found on server', async () => {
    const mockMsg: any = {
      content: `:not-emoji:`,
      author: {
        bot: false,
        avatarURL: () => jest.fn(() => {}),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      guild: {
        emojis: {
          cache: {
            find: () => fakeAnimatedEmoji,
          },
        },
      },
      delete: msgDeleteMock,
    };

    await animatedEmoji(mockMsg);
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should return if no emoji name is found in content', async () => {
    const mockMsg: any = {
      content: `abcasd`,
      author: {
        bot: false,
        avatarURL: () => jest.fn(() => {}),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      guild: {
        emojis: {
          cache: {
            find: () => fakeAnimatedEmoji,
          },
        },
      },
      delete: msgDeleteMock,
    };

    await animatedEmoji(mockMsg);
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });
});
