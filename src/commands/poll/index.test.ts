import { Collection, Webhook } from 'discord.js';
import mockConsole from 'jest-mock-console';
import { createPoll, replyWithErrorMessage } from '.';

const webhookSendMock = jest.fn();
const mockedReply = jest.fn();
const msgDeleteMock = jest.fn(() => {});
const fakeHook: any = {
  name: 'VAIT-Hook',
  channelID: '123',
  send: webhookSendMock,
};
const fakeWebhooks = new Collection<string, Webhook>();
fakeWebhooks.set('0', fakeHook);

describe('Reply with error message test', () => {
  it('Should reply with an error message', async () => {
    const mockMsg: any = {
      content: 'Test message',
      author: {
        bot: false,
      },
      reply: mockedReply,
    };
    await replyWithErrorMessage(mockMsg, 'Synthetic message');
    expect(mockedReply).toHaveBeenCalledTimes(1);
  });

  it('Should handle error with console if message cannot be sent', async () => {
    const mockMsg: any = {
      content: 'Test message',
      author: {
        bot: false,
      },
      reply: () => Promise.reject(new Error('Synthetic error')),
    };
    mockConsole();
    await replyWithErrorMessage(mockMsg, 'Synthetic message');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('Poll test', () => {
  it('Should return if author is a bot', async () => {
    const mockMsg: any = {
      author: {
        bot: true,
      },
      reply: mockedReply,
    };
    await createPoll(mockMsg);
    expect(mockedReply).not.toHaveBeenCalled();
  });

  it('Should return a message if question is not in quotes', async () => {
    const mockMsg: any = {
      content: '-poll question without quotes',
      author: {
        bot: false,
      },
      reply: mockedReply,
    };
    await createPoll(mockMsg);
    expect(mockedReply).toHaveBeenCalled();
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should send a message if it has less than 2 poll options', async () => {
    const mockMsg: any = {
      content: '-poll "question" option1',
      author: {
        bot: false,
      },
      reply: mockedReply,
    };
    await createPoll(mockMsg);
    expect(mockedReply).toHaveBeenCalled();
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it('Should send a message if it has more than 9 poll options', async () => {
    const mockMsg: any = {
      content: '-poll "question" 1 2 3 4 5 6 7 8 9 10',
      author: {
        bot: false,
      },
      reply: mockedReply,
    };
    await createPoll(mockMsg);
    expect(mockedReply).toHaveBeenCalled();
    expect(webhookSendMock).not.toHaveBeenCalled();
    expect(msgDeleteMock).not.toHaveBeenCalled();
  });

  it("Should create a webhook if there's none existing in the current channel", async () => {
    const createHookMock = jest.fn(() => {});
    const mockMsg: any = {
      content: `-poll "question" 1 2 3`,
      author: { bot: false },
      channel: {
        fetchWebhooks: async () => new Collection<string, Webhook>(),
        createWebhook: createHookMock,
      },
      delete: msgDeleteMock,
    };

    await createPoll(mockMsg);
    expect(createHookMock).toHaveBeenCalledTimes(1);
  });

  it('Should send a poll as embeded message', async () => {
    const mockMsg: any = {
      content: '-poll "question" 1 2 3',
      author: {
        bot: false,
        avatarURL: jest.fn(),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      delete: msgDeleteMock,
    };
    const mockedReact = jest.fn();
    webhookSendMock.mockReturnValueOnce({
      react: mockedReact,
    });
    await createPoll(mockMsg);
    expect(webhookSendMock).toHaveBeenCalledTimes(1);
    expect(msgDeleteMock).toHaveBeenCalledTimes(1);
    expect(mockedReact).toHaveBeenCalledTimes(3);
  });

  it('Should send a poll as embeded message, even if author avatar is undefined', async () => {
    const mockMsg: any = {
      content: '-poll "question" 1 2 3',
      author: {
        bot: false,
        avatarURL: () => undefined,
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      delete: msgDeleteMock,
    };
    const mockedReact = jest.fn();
    webhookSendMock.mockReturnValueOnce({
      react: mockedReact,
    });
    await createPoll(mockMsg);
    expect(webhookSendMock).toHaveBeenCalledTimes(1);
    expect(msgDeleteMock).toHaveBeenCalledTimes(1);
    expect(mockedReact).toHaveBeenCalledTimes(3);
  });

  it('Should handle error with console if message cannot be sent', async () => {
    const mockMsg: any = {
      content: '-poll "question" 1 2 3',
      author: {
        bot: false,
        avatarURL: jest.fn(),
      },
      channel: {
        fetchWebhooks: async () => fakeWebhooks,
        createWebhook: async () => fakeHook,
      },
      delete: msgDeleteMock,
    };
    const mockedReact = jest.fn();
    webhookSendMock.mockReturnValueOnce(
      Promise.reject(new Error('Synthetic Error'))
    );
    mockConsole();

    await createPoll(mockMsg);

    expect(webhookSendMock).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(msgDeleteMock).not.toHaveBeenCalled();
    expect(mockedReact).not.toHaveBeenCalled();
  });
});
