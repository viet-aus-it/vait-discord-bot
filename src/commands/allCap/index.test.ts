import { vi, it, describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { allCapExpandText } from '.';

const replyMock = vi.fn();

describe('All caps test', () => {
  it('Should return text app cap and expanded', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: vi.fn(() => faker.lorem.words(25)),
      },
    };

    await allCapExpandText(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  describe('All cap with no content', () => {
    const getMockInteraction = (fetchCallBack: Function): any => ({
      reply: replyMock,
      options: {
        getString: vi.fn(() => ''),
      },
      channel: {
        messages: {
          fetch: fetchCallBack,
        },
      },
    });

    describe('Fetch the previous message', () => {
      it('Should refer to previous message', async () => {
        const mockPreviousMessage = { content: 'aaa' };
        const fetchMock = vi.fn(async () => ({
          first: () => mockPreviousMessage,
        }));
        const mockMsg = getMockInteraction(fetchMock);

        await allCapExpandText(mockMsg);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('Should return nothing if there is no previous message', async () => {
        const fetchMock = vi.fn(async () => ({
          first: () => null,
        }));
        const mockMsg = getMockInteraction(fetchMock);

        await allCapExpandText(mockMsg);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
