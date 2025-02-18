import { http, type HttpHandler, HttpResponse } from 'msw';
import aocSampleData from '../../../src/slash-commands/aoc-leaderboard/sample/aoc-data.json';

export const aocHandlers: HttpHandler[] = [
  http.get('https://adventofcode.com/:year/leaderboard/private/view/:leaderboardId.json', () => {
    return HttpResponse.json(aocSampleData);
  }),
];
