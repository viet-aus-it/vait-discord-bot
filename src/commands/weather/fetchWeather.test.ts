import faker from 'faker';
import fetch from 'node-fetch';
import { mocked } from 'jest-mock';
import { fetchWeather } from './fetchWeather';

jest.mock('node-fetch');
const mockFetch = mocked(fetch);

describe('Fetch weather tests', () => {
  it('Should return undefined if cannot get weather', async () => {
    const mockedWeather: any = undefined;
    mockFetch.mockImplementationOnce(async () => mockedWeather);

    const output = await fetchWeather('Melbourne');
    expect(output).toEqual(undefined);
  });

  it('Should return weather when available', async () => {
    const fakeWeather: any = faker.lorem.words(10);

    const mockedWeather: any = { text: async () => fakeWeather };

    mockFetch.mockImplementationOnce(async () => mockedWeather);
    const output = await fetchWeather('');

    expect(output).toEqual(fakeWeather);
  });
});
