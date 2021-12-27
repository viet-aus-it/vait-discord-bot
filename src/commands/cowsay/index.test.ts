import faker from 'faker';
import { cowsay, removeBacktick } from '.';

const replyMock = jest.fn(() => {});

describe('Remove backtick test', () => {
  it("Should ignore when there's no backticks", () => {
    const input = faker.lorem.text(25);
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

  it('It should reply for any text from non-bot user', async () => {
    const mockMsg: any = {
      content: `-cowsay ${faker.lorem.words(25)}`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    await cowsay(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
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

  it('Should be able to eliminate all backticks', async () => {
    const mockMsg: any = {
      content: '-cowsay ```a lot of backticks```',
      channel: { send: replyMock },
      author: { bot: false },
    };

    await cowsay(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should be able to handle short text', async () => {
    const mockMsg: any = {
      content: '-cowsay short',
      channel: { send: replyMock },
      author: { bot: false },
    };

    await cowsay(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should be able to handle long text', async () => {
    const mockMsg: any = {
      content: `-cowsay ${faker.lorem.text(30)}`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    await cowsay(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  describe('For cowsay with no content', () => {
    const getMockMsg = (fetchCallBack: Function) => ({
      content: `-mock`,
      channel: {
        send: replyMock,
        messages: { fetch: fetchCallBack },
      },
      author: { bot: false },
    });

    const getMockMsgWithReference = (
      fetchCallBack: Function,
      reference: undefined | { messageId: string }
    ) => ({
      ...getMockMsg(fetchCallBack),
      reference,
    });

    describe('Fetch referred message', () => {
      it('Should cowsay the refered message', async () => {
        const messageWithContent = { content: faker.lorem.word(10) };
        const fetchMock = jest.fn(async () => messageWithContent);
        const mockMsg: any = getMockMsgWithReference(fetchMock, {
          messageId: '1',
        });

        await cowsay(mockMsg);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Fetch the previous message', () => {
      it('Should throw error if previous message cannot be retrieved', async () => {
        const fetchMock = jest.fn(async () => ({
          first: () => undefined,
        }));
        const mockMsg: any = getMockMsg(fetchMock);

        await cowsay(mockMsg);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('It should refer to previous message', async () => {
        const mockPreviousMessage = { content: faker.lorem.word(10) };
        const fetchMock = jest.fn(async () => ({
          first: () => mockPreviousMessage,
        }));
        const mockMsg: any = getMockMsg(fetchMock);

        await cowsay(mockMsg);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });

    it('Should throw errors when failed to send Cowsay text', async () => {
      const mockError = jest.fn(async () => {
        throw new Error('Something went wrong');
      });

      const mockMsg: any = {
        content: '-cowsay say what?',
        channel: { send: mockError },
        author: { bot: false },
      };

      await cowsay(mockMsg);
      expect(mockError).toHaveBeenCalledTimes(1);
    });
  });
});
