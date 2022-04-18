import faker from '@faker-js/faker';
import { mockSomeone } from '.';

const replyMock = jest.fn();

describe('mockSomeone test', () => {
  beforeEach(() => {
    replyMock.mockClear();
  });

  it('Should mock text if it has -mock prefix', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: jest.fn(() => faker.lorem.words(25)),
      },
    };

    await mockSomeone(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  describe('For -mock prefix with blank content', () => {
    const getMockInteraction = (fetchCallback: Function): any => ({
      reply: replyMock,
      options: {
        getString: jest.fn(() => ''),
      },
      channel: {
        messages: { fetch: fetchCallback },
      },
    });

    describe('Fetching previous message', () => {
      it('Should throw error if previous message cannot be retrieved', async () => {
        const fetchMock = jest.fn(async () => ({
          first: () => undefined,
        }));
        const mockInteraction = getMockInteraction(fetchMock);

        await mockSomeone(mockInteraction);
        expect(replyMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('Should return blank if previous message is blank', async () => {
        const blankMessage = { content: '' };
        const fetchMock = jest.fn(async () => ({
          first: () => blankMessage,
        }));
        const mockInteraction = getMockInteraction(fetchMock);

        await mockSomeone(mockInteraction);
        expect(replyMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('Should mock the previous message', async () => {
        const messageWithContent = { content: faker.lorem.words(25) };
        const fetchMock = jest.fn(async () => ({
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
