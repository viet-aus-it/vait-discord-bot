import { Collection, Webhook, GuildEmoji } from 'discord.js';
import mockConsole from 'jest-mock-console';
import animatedEmoji from '.';

const webhookSendMock = jest.fn(() => {});
const msgDeleteMock = jest.fn(() => {});

const fakeHook: any = {
  name: 'VAIT-Hook',
  channelID: '123',
  send: webhookSendMock,
};

const fakeWebhooks = new Collection<string, Webhook>();
fakeWebhooks.set('0', fakeHook);

const fakeAnimatedEmoji: any = {
  name: 'sadparrot',
  animated: true,
};

const fakeEmojiCache = new Collection<string, GuildEmoji>();
fakeEmojiCache.set('0', fakeAnimatedEmoji);

describe('animated emoji test', () => {
  it('Should return if author is a bot', async () => {
    const mockMsg: any = {
      content: `:sadparrot:`,
      author: { bot: true },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      guild: {
        emojis: { cache: fakeEmojiCache },
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
        emojis: { cache: fakeEmojiCache },
      },
      delete: msgDeleteMock,
    };

    await animatedEmoji(mockMsg);
    expect(fetchHookMock).not.toHaveBeenCalled();
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
        emojis: { cache: fakeEmojiCache },
      },
      delete: msgDeleteMock,
    };

    await animatedEmoji(mockMsg);
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should create a webhook if no webhook is found', async () => {
    const createHookMock = jest.fn(() => {});
    const mockMsg: any = {
      content: `:sadparrot:`,
      author: { bot: false },
      channel: {
        fetchWebhooks: async () => new Collection<string, Webhook>(),
        createWebhook: createHookMock,
      },
      guild: {
        emojis: { cache: fakeEmojiCache },
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
        emojis: { cache: fakeEmojiCache },
      },
      delete: msgDeleteMock,
    };

    await animatedEmoji(mockMsg);
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should return if only 1 emoji is found, but it is not animated', async () => {
    const fakeStaticEmoji: any = {
      name: 'static-emoji',
      animated: false,
    };
    fakeEmojiCache.set('1', fakeStaticEmoji);

    const mockMsg: any = {
      content: ':static-emoji:',
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
        emojis: { cache: fakeEmojiCache },
      },
      delete: msgDeleteMock,
    };
    await animatedEmoji(mockMsg);

    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should send a message with embeded animated emoji', async () => {
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
        emojis: { cache: fakeEmojiCache },
      },
      delete: msgDeleteMock,
    };
    await animatedEmoji(mockMsg);
    expect(webhookSendMock).toHaveBeenCalledTimes(1);
    expect(msgDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('Should send a message with embeded animated emoji even if user avatar is not found', async () => {
    const mockMsg: any = {
      content: ':sadparrot:',
      author: {
        bot: false,
        avatarURL: () => undefined,
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
        id: '123',
      },
      guild: {
        emojis: { cache: fakeEmojiCache },
      },
      delete: msgDeleteMock,
    };
    await animatedEmoji(mockMsg);
    expect(webhookSendMock).toHaveBeenCalledTimes(1);
    expect(msgDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('Should handle error with console if there is an error with sending the message', async () => {
    const fakeFailHook: any = {
      ...fakeHook,
      send: jest.fn(() => Promise.reject(new Error('Synthetic Error'))),
    };
    const fakeHooks = new Collection<string, Webhook>();
    fakeHooks.set('0', fakeFailHook);
    const mockMsg: any = {
      content: ':sadparrot:',
      author: {
        bot: false,
        avatarURL: () => jest.fn(() => {}),
      },
      channel: {
        fetchWebhooks: async () => fakeHooks,
        createWebhook: async () => fakeFailHook,
        id: '123',
      },
      guild: {
        emojis: { cache: fakeEmojiCache },
      },
      delete: msgDeleteMock,
    };

    mockConsole();
    await animatedEmoji(mockMsg);
    expect(console.error).toHaveBeenCalled();
  });
});
