import { faker } from '@faker-js/faker';
import { ChatInputCommandInteraction } from 'discord.js';
import { rest } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { weather } from '.';
import { server } from '../../mocks/server';
import { WEATHER_URL } from './fetchWeather';

const mockWeatherMessage = faker.lorem.words(10);

const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('Weather test', () => {
  beforeEach(() => {
    const endpoint = rest.get(`${WEATHER_URL}:location`, (req, res, ctx) => {
      if (req.url.pathname === '/ErrorLocation') {
        return res(ctx.status(500, 'Simulated Error'));
      }

      return res(ctx.status(200), ctx.text(mockWeatherMessage));
    });
    server.use(endpoint);

    mockReset(mockInteraction);
  });

  it('Should reply command with weather data', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('Hanoi');

    await weather(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith(`\`\`\`\n${mockWeatherMessage}\n\`\`\``);
  });

  it('Should run with default input if no input is given', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('');

    await weather(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith(`\`\`\`\n${mockWeatherMessage}\n\`\`\``);
  });

  it('Should reply with error if given an error location', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('ErrorLocation');

    await weather(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Error getting weather data for location.');
  });

  it('Should reply with error if input is valid but weather data cannot be downloaded', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('Brisbane');
    const endpoint = rest.get(`${WEATHER_URL}:location`, (_, res, ctx) => {
      return res(ctx.status(500), ctx.json(undefined));
    });
    server.use(endpoint);

    await weather(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Error getting weather data for location.');
  });
});
