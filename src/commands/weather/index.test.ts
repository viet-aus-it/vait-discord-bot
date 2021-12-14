import faker from 'faker';
import { mocked } from 'jest-mock';
import weather from '.';
import fetchWeather from './fetchWeather';

jest.mock('./fetchWeather');
const mockFetch = mocked(fetchWeather);

const replyMock = jest.fn(() => {});

describe('Weather test', () => {
  it('Should not reply bot', async () => {
    const mockMsg: any = {
      content: `-weather`,
      channel: { send: replyMock },
      author: { bot: true },
    };

    await weather(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('Should reply command from non-bot user', async () => {
    const mockMsg: any = {
      content: `-weather Hanoi`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    const fakeWeather = faker.lorem.words(10);
    mockFetch.mockImplementationOnce(async () => fakeWeather);

    await weather(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should run even if there is no content', async () => {
    const mockMsg: any = {
      content: `-weather`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    const fakeWeather = faker.lorem.words(10);
    mockFetch.mockImplementationOnce(async () => fakeWeather);

    await weather(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should return if there is no weather downloaded', async () => {
    const mockMsg: any = {
      content: `-weather`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    mockFetch.mockImplementationOnce(async () => undefined);
    await weather(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });
});
