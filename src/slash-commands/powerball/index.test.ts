import { describe, expect } from 'vitest';
import { captor } from 'vitest-mock-extended';
import { powerball } from '.';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';

describe('powerball', () => {
  chatInputCommandInteractionTest('should return correct number of games', async ({ interaction }) => {
    const gameCount = 5;
    interaction.options.getInteger.mockReturnValueOnce(gameCount);
    const games = captor<string>();

    await powerball(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(games);
    expect(games.value.split('\n').length).toEqual(gameCount);
  });

  chatInputCommandInteractionTest('should return 7 unique numbers from 1-35', async ({ interaction }) => {
    interaction.options.getInteger.mockReturnValueOnce(1);
    const singleGame = captor<string>();

    await powerball(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(singleGame);

    let gameValue = singleGame.value.replaceAll('`', '');
    gameValue = gameValue.substring(0, gameValue.indexOf('PB')).trim();
    const uniqueNumbers = gameValue.split(' ');
    expect(uniqueNumbers.length).toEqual(new Set(uniqueNumbers).size);
  });

  chatInputCommandInteractionTest('should return the correct format', async ({ interaction }) => {
    interaction.options.getInteger.mockReturnValueOnce(10);
    const games = captor<string>();
    const regex = /^(\d{2}\s){7}PB:\d{2}$/gm; // Matches multiline of 00 00 00 00 00 00 00 PB:00

    await powerball(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(games);
    expect(games.value.replaceAll('`', '')).toMatch(regex);
  });

  chatInputCommandInteractionTest('PB numbers from 1 - 20', async ({ interaction }) => {
    interaction.options.getInteger.mockReturnValueOnce(1);
    const singleGame = captor<string>();

    await powerball(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(singleGame);

    const gameValue = singleGame.value.replaceAll('`', '');
    const pbNumber = gameValue.substring(gameValue.indexOf(':') + 1);
    const pbValue = Number.parseInt(pbNumber, 10);
    expect(pbValue).lessThanOrEqual(20).greaterThanOrEqual(1);
  });
});
