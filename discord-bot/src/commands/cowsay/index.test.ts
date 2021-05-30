import cowsay from '.';

const replyMock = jest.fn(() => {});

describe('cowsay test', () => {
  it('It should reply for any text from non-bot user', async () => {
    const mockMsg: any = {
      content: '-cowsay lorem ipsum',
      channel: { send: replyMock },
      author: { bot: false },
    };

    await cowsay(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should not reply if there is no content and reference', async () => {
    const mockMsg: any = {
      content: '-cowsay ',
      channel: { send: replyMock },
      author: { bot: false },
    };

    await cowsay(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('Should not reply if the sender is a bot', async () => {
    const mockMsg: any = {
      content: '-cowsay I am a bot',
      channel: { send: replyMock },
      author: { bot: true },
    };

    await cowsay(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });
});
