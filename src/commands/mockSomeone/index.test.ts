import { vi, it, describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { mockSomeone } from './index.js';

const replyMock = vi.fn();

describe('mockSomeone test', () => {
  beforeEach(() => {
    replyMock.mockClear();
  });

  it('Should mock text if it was called by /mock', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: vi.fn(() => faker.lorem.words(25)),
      },
    };

    await mockSomeone(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  describe('For /mock call with blank content', () => {
    const getMockInteraction = (fetchCallback: Function): any => ({
      reply: replyMock,
      options: {
        getString: vi.fn(() => ''),
      },
      channel: {
        messages: { fetch: fetchCallback },
      },
    });

    describe('Fetching previous message', () => {
      it('Should throw error if previous message cannot be retrieved', async () => {
        const fetchMock = vi.fn(async () => ({
          first: () => undefined,
        }));
        const mockInteraction = getMockInteraction(fetchMock);

        await mockSomeone(mockInteraction);
        expect(replyMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('Should return blank if previous message is blank', async () => {
        const blankMessage = { content: '' };
        const fetchMock = vi.fn(async () => ({
          first: () => blankMessage,
        }));
        const mockInteraction = getMockInteraction(fetchMock);

        await mockSomeone(mockInteraction);
        expect(replyMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('Should mock the previous message', async () => {
        const messageWithContent = { content: faker.lorem.words(25) };
        const fetchMock = vi.fn(async () => ({
          first: () => messageWithContent,
        }));
        const mockInteraction = getMockInteraction(fetchMock);

        await mockSomeone(mockInteraction);
        expect(replyMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
