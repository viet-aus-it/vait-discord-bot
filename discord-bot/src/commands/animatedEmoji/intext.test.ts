import animatedEmoji from '.';

const replyMock = jest.fn(() => {});
describe('animated emoji test', () => {
  it('Should return a message with embeded animated emoji', async () => {
    const mockMsg: any = {
      content: `:sadparrot:`,
      author: { bot: false },
    };

    await animatedEmoji(mockMsg);
    expect(replyMock.mock.calls.length).toBe(1);
  });
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
      content: `sadparrot`,
      author: { bot: false },
    };

    await animatedEmoji(mockMsg);
    expect(replyMock.mock.calls.length).toBe(0);
  });
});
