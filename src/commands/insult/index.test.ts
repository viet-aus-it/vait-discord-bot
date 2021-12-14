import faker from 'faker';
import { randomCreate, randomQuote } from './insultGenerator';
import { fetchMessageObjectById } from '../../utils';
import insult from '.';

jest.mock('../../utils/messageFetcher');
const mockFetchMsgObjByID = fetchMessageObjectById as jest.MockedFunction<
  typeof fetchMessageObjectById
>;

const replyMock = jest.fn(() => {});

const getMockMsg = (fetchCallBack: Function) => ({
  content: `-insult`,
  channel: {
    send: replyMock,
    messages: { fetch: fetchCallBack },
  },
  author: { bot: false },
});

const getMockMsgWithReference = (
  fetchCallBack: Function,
  reference:
    | undefined
    | {
        messageID: string;
      }
) => ({
  ...getMockMsg(fetchCallBack),
  reference,
});

describe('Insult someone test', () => {
  beforeEach(() => replyMock.mockClear());

  it('Should send an insult if there is -insult prefix', async () => {
    const mockMsg: any = {
      content: `-insult`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    await insult(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should not insult if the author is a bot', async () => {
    const mockMsg: any = {
      content: `-insult`,
      channel: { send: replyMock },
      author: { bot: true },
    };

    await insult(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('Should insult the chat content', async () => {
    const mockMsg: any = {
      content: `-insult Lorem Ipsum `,
      channel: { send: replyMock },
      author: { bot: false },
    };

    await insult(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should be able to mock the referred message author', async () => {
    const messageWithContent = { content: faker.lorem.word(10) };
    const fetchMock = jest.fn(async () => messageWithContent);
    const mockMsg: any = getMockMsgWithReference(fetchMock, {
      messageID: '1',
    });

    const mockedFetchedMsg: any = {
      author: {
        id: '69420',
        username: faker.lorem.words(5),
        avatarURL: jest.fn(),
      },
      createdTimestamp: 1235123123,
      content: faker.lorem.words(25),
      id: 678,
    };

    mockFetchMsgObjByID.mockReturnValue(mockedFetchedMsg);

    await insult(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should throw error if cannot send insult', async () => {
    const mockError = jest.fn(async () => {
      throw new Error('Something went wrong');
    });

    const mockMsg: any = {
      content: '-insult A',
      channel: { send: mockError },
      author: { bot: false },
    };

    await insult(mockMsg);
    expect(mockError).toHaveBeenCalledTimes(1);
  });
});

describe('Insult Library test', () => {
  beforeEach(() => replyMock.mockClear());

  it('Should be able to generate a random insult', () => {
    const insultString: any = randomCreate();
    expect(typeof insultString).toEqual('string');
  });

  it('Should be able to quote a random insult', () => {
    const insultString: any = randomQuote();
    expect(typeof insultString).toEqual('string');
  });
});
