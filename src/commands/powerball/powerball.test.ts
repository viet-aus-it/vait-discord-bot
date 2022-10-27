import { getPowerBallGame } from '.';
import { getUniqueRandomIntInclusive } from '../../utils';
// /powerball n number (1-10)

// 1. 7 unique numbers from 1 - 35
// 2. PB numbers from 1 - 20
// 3. n number of games
// 4. format

describe('powerball', () => {
  it('should return correct number of games', async () => {
    const gameCount = 5;
    const games = getPowerBallGame(gameCount);
    expect(games.split('\n').length).toEqual(gameCount);
  });

  it('should return 7 unique numbers from 1-35', async () => {
    let singleGame = getPowerBallGame(1).replaceAll('`', '');
    singleGame = singleGame.substring(0, singleGame.indexOf('P')).trim();
    const uniqueNumbers = singleGame.split(' ');
    expect(uniqueNumbers.length).toEqual(new Set(uniqueNumbers).size);
  });

  it('should return the correct format', async () => {
    const games = getPowerBallGame(10);
    expect(games.match(/([0-9]{2}\s){7}\sPB: [0-9]{2}\n?/));
  });

  it('PB numbers from 1 - 20', async () => {
    const singleGame = getPowerBallGame(1).replaceAll('`', '');
    const powerball = singleGame
      .substring(singleGame.indexOf(':') + 1, singleGame.length)
      .trim();
    expect(Number(powerball)).lessThanOrEqual(20).greaterThanOrEqual(1);
  });
});

describe('Random unique number', () => {
  it('should return a unique number that is not in the array', async () => {
    const number = getUniqueRandomIntInclusive([1, 2, 3], 1, 4);
    expect(number).toEqual(4);
  });
});
