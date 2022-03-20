import faker from '@faker-js/faker';
import { allCapExpandText } from '.';

const replyMock = jest.fn(() => {});

describe('All caps test', () => {
  it('Should return if sender is a bot', async () => {
    const mockMsg: any = {
      content: `-allcaps ${faker.lorem.words(25)}`,
      channel: { send: replyMock },
      author: { bot: true },
    };

    await allCapExpandText(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('Should return text app cap and expanded', async () => {
    const mockMsg: any = {
      content: `-allcaps abcdefg`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    await allCapExpandText(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith('A B C D E F G');
  });

  describe('All cap with no content', () => {
    const getMockMsg = (fetchCallback: Function) => ({
      content: `-allcaps`,
      channel: {
        send: replyMock,
        messages: { fetch: fetchCallback },
      },
      author: {
        bot: false,
      },
    });

    const getMockMessageWithReference = (
      fetchCallback: Function,
      reference: undefined | { messageId: string }
    ) => ({
      ...getMockMsg(fetchCallback),
      reference,
    });

    it('Should get the refered message', async () => {
      const messageWithContent = { content: 'aaa' };
      const fetchMock = jest.fn(() => messageWithContent);
      const mockMsg: any = getMockMessageWithReference(fetchMock, {
        messageId: '1',
      });

      await allCapExpandText(mockMsg);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledWith('A A A');
    });

    describe('Fetch the previous message', () => {
      it('Should refer to previous message', async () => {
        const mockPreviousMessage = { content: 'aaa' };
        const fetchMock = jest.fn(async () => ({
          first: () => mockPreviousMessage,
        }));
        const mockMsg: any = getMockMsg(fetchMock);

        await allCapExpandText(mockMsg);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(replyMock).toHaveBeenCalledWith('A A A');
      });

      it('Should return nothing if there is no previous message', async () => {
        const fetchMock = jest.fn(async () => ({
          first: () => null,
        }));
        const mockMsg: any = getMockMsg(fetchMock);

        await allCapExpandText(mockMsg);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(replyMock).toHaveBeenCalledWith('');
      });
    });
  });
});
