import type { ChatInputCommandInteraction } from 'discord.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { captor, mockDeep, mockReset } from 'vitest-mock-extended';
import { powerball } from '.';

const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('powerball', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('should return correct number of games', async () => {
    const gameCount = 5;
    mockInteraction.options.getInteger.mockReturnValueOnce(gameCount);
    const games = captor<string>();

    await powerball(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith(games);
    expect(games.value.split('\n').length).toEqual(gameCount);
  });

  it('should return 7 unique numbers from 1-35', async () => {
    mockInteraction.options.getInteger.mockReturnValueOnce(1);
    const singleGame = captor<string>();

    await powerball(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith(singleGame);

    let gameValue = singleGame.value.replaceAll('`', '');
    gameValue = gameValue.substring(0, gameValue.indexOf('PB')).trim();
    const uniqueNumbers = gameValue.split(' ');
    expect(uniqueNumbers.length).toEqual(new Set(uniqueNumbers).size);
  });

  it('should return the correct format', async () => {
    mockInteraction.options.getInteger.mockReturnValueOnce(10);
    const games = captor<string>();
    const regex = /^(\d{2}\s){7}PB:\d{2}$/gm; // Matches multiline of 00 00 00 00 00 00 00 PB:00

    await powerball(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith(games);
    expect(games.value.replaceAll('`', '')).toMatch(regex);
  });

  it('PB numbers from 1 - 20', async () => {
    mockInteraction.options.getInteger.mockReturnValueOnce(1);
    const singleGame = captor<string>();

    await powerball(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith(singleGame);

    const gameValue = singleGame.value.replaceAll('`', '');
    const pbNumber = gameValue.substring(gameValue.indexOf(':') + 1);
    const pbValue = Number.parseInt(pbNumber, 10);
    expect(pbValue).lessThanOrEqual(20).greaterThanOrEqual(1);
  });
});
