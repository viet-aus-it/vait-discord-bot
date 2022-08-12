import { vi, it, describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { ask8Ball } from '.';

const replyMock = vi.fn();

describe('ask 8Ball test', () => {
  it('Should return yes or no randomly for any question', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: vi.fn(() => faker.lorem.words(25)),
      },
    };

    await ask8Ball(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});
