import { it, describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { rest } from 'msw';
import { server } from '../../mocks/server';
import { fetchWeather, getWeatherURL } from './fetchWeather';

describe('Fetch weather tests', () => {
  const mockWeatherMessage = faker.lorem.words(10);

  beforeEach(() => {
    const url = getWeatherURL(':location');
    const endpoint = rest.get(url, (req, res, ctx) => {
      if (req.url.pathname === '/ErrorLocation') {
        return res(ctx.status(500, 'Simulated Error'));
      }

      return res(ctx.status(200), ctx.text(mockWeatherMessage));
    });
    server.use(endpoint);
  });

  it('Should return undefined if cannot get weather', async () => {
    const output = await fetchWeather('ErrorLocation');
    expect(output).toBeUndefined();
  });

  it('Should return weather when available', async () => {
    const output = await fetchWeather('Brisbane');
    expect(output).toEqual(mockWeatherMessage);
  });
});
