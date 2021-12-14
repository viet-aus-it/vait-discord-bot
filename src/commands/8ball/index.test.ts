import faker from 'faker';
import ask8Ball from '.';

const replyMock = jest.fn(() => {});

describe('ask 8Ball test', () => {
  it('Should return yes or no randomly for any question', async () => {
    const mockMsg: any = {
      content: `-8ball ${faker.lorem.words(25)}`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    await ask8Ball(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should return if no question asked', async () => {
    const mockMsg: any = {
      content: `-8ball`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    await ask8Ball(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('Should return if author is a bot', async () => {
    const mockMsg: any = {
      content: `-8ball ateasea`,
      channel: { send: replyMock },
      author: { bot: true },
    };

    await ask8Ball(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });
});