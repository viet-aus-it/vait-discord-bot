import { faker } from '@faker-js/faker';
import { ask8Ball } from '.';

const replyMock = jest.fn();

describe('ask 8Ball test', () => {
  it('Should return yes or no randomly for any question', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: jest.fn(() => faker.lorem.words(25)),
      },
    };

    await ask8Ball(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});
