import { vi, it, describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { rest } from 'msw';
import { weather } from '.';
import { server } from '../../mocks/server';
import { WEATHER_URL } from './fetchWeather';

const deferReplyMock = vi.fn();
const editReplyMock = vi.fn();
const mockWeatherMessage = faker.lorem.words(10);

describe('Weather test', () => {
  beforeEach(() => {
    const endpoint = rest.get(`${WEATHER_URL}:location`, (req, res, ctx) => {
      if (req.url.pathname === '/ErrorLocation') {
        return res(ctx.status(500, 'Simulated Error'));
      }

      return res(ctx.status(200), ctx.text(mockWeatherMessage));
    });
    server.use(endpoint);
  });

  it('Should reply command with weather data', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
      options: {
        getString: vi.fn(() => 'Hanoi'),
      },
    };

    await weather(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith(
      `\`\`\`\n${mockWeatherMessage}\n\`\`\``
    );
  });

  it('Should run with default input if no input is given', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
      options: {
        getString: vi.fn(() => ''),
      },
    };

    await weather(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith(
      `\`\`\`\n${mockWeatherMessage}\n\`\`\``
    );
  });

  it('Should reply with error if given an error location', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
      options: {
        getString: vi.fn(() => 'ErrorLocation'),
      },
    };

    await weather(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith(
      'Error getting weather data for location.'
    );
  });

  it('Should reply with error if input is valid but weather data cannot be downloaded', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
      options: {
        getString: vi.fn(() => 'Brisbane'),
      },
    };
    const endpoint = rest.get(`${WEATHER_URL}:location`, (_, res, ctx) => {
      return res(ctx.status(500), ctx.json(undefined));
    });
    server.use(endpoint);

    await weather(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith(
      'Error getting weather data for location.'
    );
  });
});
