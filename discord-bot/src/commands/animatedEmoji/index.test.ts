// import { Collection, Webhook } from 'discord.js';
import animatedEmoji from '.';

const replyMock = jest.fn(() => {});
describe('animated emoji test', () => {
  /* it('Should return a message with embeded animated emoji', async () => {
    const fakeHook = { name: 'Jkiller-hook', guildID: '123' };
    const fakeWebhooks = new Collection<string, Webhook>();
    fakeWebhooks.set('0', fakeHook);
    const mockMsg: any = {
      guild: {
        fetchWebHooks: async () => fakeWebhooks,
      }
    }

    await animatedEmoji(mockMsg);
    expect(replyMock.mock.calls.length).toBe(1);
  }); */
  it('Should return if author is a bot', async () => {
    const mockMsg: any = {
      content: `:sadparrot:`,
      author: { bot: true },
    };

    await animatedEmoji(mockMsg);
    expect(replyMock.mock.calls.length).toBe(0);
  });
  it('Should return if no emoji is found', async () => {
    const mockMsg: any = {
      content: `:invalid:`,
      author: { bot: false },
    };

    await animatedEmoji(mockMsg);
    expect(replyMock.mock.calls.length).toBe(0);
  });
  it('Should return if no emoji name is found in content', async () => {
    const mockMsg: any = {
      content: `abcasd`,
      author: { bot: false },
    };

    await animatedEmoji(mockMsg);
    expect(replyMock.mock.calls.length).toBe(0);
  });
});
