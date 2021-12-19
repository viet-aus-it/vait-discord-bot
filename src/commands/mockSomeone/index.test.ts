import faker from 'faker';
import { mockSomeone } from '.';

const replyMock = jest.fn(() => {});

describe('mockSomeone test', () => {
  beforeEach(() => {
    replyMock.mockClear();
  });

  it('Should mock text if it has -mock prefix', async () => {
    const mockMsg: any = {
      content: `-mock ${faker.lorem.words(25)}`,
      channel: { send: replyMock },
      author: {
        bot: false,
      },
    };

    await mockSomeone(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should not mock text if author is bot', async () => {
    const mockMsg: any = {
      content: `-mock ${faker.lorem.words(25)}`,
      channel: { send: replyMock },
      author: {
        bot: true,
      },
    };

    await mockSomeone(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });

  describe('For -mock prefix with blank content', () => {
    const getMockMsg = (fetchCallback: Function) => ({
      content: `-mock`,
      channel: {
        send: replyMock,
        messages: { fetch: fetchCallback },
      },
      author: {
        bot: false,
      },
    });

    const getBotMockMsg = (fetchCallback: Function) => ({
      content: `-mock`,
      channel: {
        send: replyMock,
        messages: { fetch: fetchCallback },
      },
      author: {
        bot: true,
      },
    });

    const getMockMessageWithReference = (
      fetchCallback: Function,
      reference: undefined | { messageID: string }
    ) => ({
      ...getMockMsg(fetchCallback),
      reference,
    });

    it('Should throw error if previous message fetch function screwed up', async () => {
      const fetchMock = jest.fn(async () => undefined);
      const mockMsg: any = getMockMsg(fetchMock);

      await mockSomeone(mockMsg);
      expect(replyMock).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    describe('Fetching previous message', () => {
      it('Should throw error if previous message cannot be retrieved', async () => {
        const fetchMock = jest.fn(async () => ({
          first: () => undefined,
        }));
        const mockMsg: any = getMockMsg(fetchMock);

        await mockSomeone(mockMsg);
        expect(replyMock).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('Should return blank if previous message is blank', async () => {
        const blankMessage = { content: '' };
        const fetchMock = jest.fn(async () => ({
          first: () => blankMessage,
        }));
        const mockMsg: any = getMockMsg(fetchMock);

        await mockSomeone(mockMsg);
        expect(replyMock).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('Should return blank if sender is a bot', async () => {
        const blankMessage = { content: '' };
        const fetchMock = jest.fn(async () => ({
          first: () => blankMessage,
        }));
        const mockMsg: any = getBotMockMsg(fetchMock);

        await mockSomeone(mockMsg);
        expect(replyMock).not.toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('Should mock the previous message', async () => {
        const messageWithContent = { content: faker.lorem.words(25) };
        const fetchMock = jest.fn(async () => ({
          first: () => messageWithContent,
        }));
        const mockMsg: any = getMockMsg(fetchMock);

        await mockSomeone(mockMsg);
        expect(replyMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Fetching referred message', () => {
      it('Should throw error if referred message cannot be fetched by id', async () => {
        const fetchMock = jest.fn(async () => undefined);
        const mockMsg: any = getMockMessageWithReference(fetchMock, {
          messageID: '1234',
        });

        await mockSomeone(mockMsg);
        expect(replyMock).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('Should return blank if referred message is blank', async () => {
        const blankMessage = { content: '' };
        const fetchMock = jest.fn(async () => blankMessage);
        const mockMsg: any = getMockMessageWithReference(fetchMock, {
          messageID: '1234',
        });

        await mockSomeone(mockMsg);
        expect(replyMock).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('Should mock the referred message', async () => {
        const messageWithContent = { content: faker.lorem.words(25) };
        const fetchMock = jest.fn(async () => messageWithContent);
        const mockMsg: any = getMockMessageWithReference(fetchMock, {
          messageID: '1234',
        });

        await mockSomeone(mockMsg);
        expect(replyMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
