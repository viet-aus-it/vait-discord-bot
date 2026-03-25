import wretch from 'wretch';
import { logger } from '../../utils/logger';
import { tracer } from '../../utils/tracer';
import { AocLeaderboard } from './schema';

function getAocClient(aocKey: string) {
  return wretch('https://adventofcode.com')
    .options({ credentials: 'same-origin' })
    .headers({
      Cookie: `session=${aocKey}`,
      'User-Agent': 'https://github.com/viet-aus-it/discord-bot by admin@vietausit.com',
    });
}

export async function fetchLeaderboard(aocKey: string, leaderboardId: string, year: number) {
  return tracer.startActiveSpan('http.aoc', async (span) => {
    span.setAttribute('aoc.leaderboardId', leaderboardId);
    span.setAttribute('aoc.year', year);
    try {
      const result = await getAocClient(aocKey).url(`/${year}/leaderboard/private/view/${leaderboardId}.json`).get().json();

      const parsedResult = AocLeaderboard.safeParse(result);
      if (!parsedResult.success) {
        logger.error('ERROR: Cannot get leaderboard format.', parsedResult.error);
        throw new Error(parsedResult.error.stack);
      }

      return parsedResult.data;
    } finally {
      span.end();
    }
  });
}
