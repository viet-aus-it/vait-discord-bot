import { faker } from '@faker-js/faker';
import { weather } from '.';
import { fetchWeather } from './fetchWeather';

jest.mock('./fetchWeather');
const mockFetch = jest.mocked(fetchWeather);

const deferReplyMock = jest.fn();
const editReplyMock = jest.fn();

describe('Weather test', () => {
  it('Should reply command with weather data', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
      options: {
        getString: jest.fn(() => 'Hanoi'),
      },
    };

    const fakeWeather = faker.lorem.words(10);
    mockFetch.mockImplementationOnce(async () => fakeWeather);

    await weather(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith(
      `\`\`\`\n${fakeWeather}\n\`\`\``
    );
  });

  it('Should run even if there is no content', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
      options: {
        getString: jest.fn(() => ''),
      },
    };

    const fakeWeather = faker.lorem.words(10);
    mockFetch.mockImplementationOnce(async () => fakeWeather);

    await weather(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith(
      `\`\`\`\n${fakeWeather}\n\`\`\``
    );
  });

  it('Should return if there is no weather downloaded', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
      options: {
        getString: jest.fn(() => ''),
      },
    };

    mockFetch.mockImplementationOnce(async () => undefined);

    await weather(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith(
      'Error getting weather data for location.'
    );
  });
});
