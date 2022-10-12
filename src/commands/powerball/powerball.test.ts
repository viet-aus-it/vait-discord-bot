import { getPowerBallGame } from '.';

// /powerball n number (1-10)

// 1. 7 unique numbers from 1 - 35
// 2. PB numbers from 1 - 20
// 3. n number of games
// 4. format
// 5. 1-10

describe('powerball', () => {
  it('should return correct number of games', async () => {
    const gameCount = 6;

    const games = getPowerBallGame(gameCount);

    console.log(games);
  });
});
