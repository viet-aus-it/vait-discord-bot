import faker from '@faker-js/faker';
import { cowsay, removeBacktick } from '.';

const replyMock = jest.fn();

describe('Remove backtick test', () => {
  it("Should ignore when there's no backticks", () => {
    const input = faker.lorem.slug(25);
    const output = removeBacktick(input);
    expect(output).toEqual(input);
  });

  it('Should remove backtick if it exists', () => {
    const input = '```aaaaa```';
    const output = removeBacktick(input);
    expect(output).toEqual('aaaaa');
  });
});

describe('cowsay test', () => {
  beforeEach(() => {
    replyMock.mockClear();
  });

  it('It should reply for any text', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: jest.fn(() => faker.lorem.words(25)),
      },
    };

    await cowsay(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should be able to eliminate all backticks', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: jest.fn(() => '```a lot of backticks```'),
      },
    };

    await cowsay(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should be able to handle short text', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: jest.fn(() => 'short'),
      },
    };

    await cowsay(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should be able to handle long text', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: jest.fn(() => faker.lorem.slug(30)),
      },
    };

    await cowsay(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  describe('For cowsay with no content', () => {
    const getMockInteraction = (fetchCallBack: Function): any => ({
      reply: replyMock,
      options: {
        getString: jest.fn(() => ''),
      },
      channel: {
        messages: {
          fetch: fetchCallBack,
        },
      },
    });

    describe('Fetch the previous message', () => {
      it('Should throw error if previous message cannot be retrieved', async () => {
        const fetchMock = jest.fn(async () => ({
          first: () => undefined,
        }));
        const mockInteraction = getMockInteraction(fetchMock);

        await cowsay(mockInteraction);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('It should refer to previous message', async () => {
        const mockPreviousMessage = { content: faker.lorem.word(10) };
        const fetchMock = jest.fn(async () => ({
          first: () => mockPreviousMessage,
        }));
        const mockInteraction = getMockInteraction(fetchMock);

        await cowsay(mockInteraction);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });

    it('Should throw errors when failed to send Cowsay text', async () => {
      const mockError = jest.fn(async () => {
        throw new Error('Something went wrong');
      });
      const mockInteraction: any = {
        reply: mockError,
        options: {
          getString: jest.fn(() => 'say what?'),
        },
      };

      await cowsay(mockInteraction);
      expect(mockError).toHaveBeenCalledTimes(1);
    });
  });
});
