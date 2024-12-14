import { subHours } from 'date-fns';
import type { ChatInputCommandInteraction } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { execute, formatLeaderboard, getAocYear } from '.';
import mockAocData from './sample/aoc-data.json';
import { AocLeaderboard } from './schema';
import { fetchAndSaveLeaderboard, getAocSettings, getSavedLeaderboard } from './utils';

vi.mock('./utils');
const mockGetSavedLeaderboard = vi.mocked(getSavedLeaderboard);
const mockGetAocSettings = vi.mocked(getAocSettings);
const mockFetchAndSaveLeaderboard = vi.mocked(fetchAndSaveLeaderboard);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();
const parsedMockData = AocLeaderboard.parse(mockAocData);

const mockSystemTime = new Date(2024, 11, 25, 16, 0, 0); // 25/12/2024 16:00:00
const oneHourEarlier = subHours(mockSystemTime, 1); // 25/12/2024 15:00:00

describe('Get AOC Leaderboard test', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockSystemTime);
    mockReset(mockInteraction);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Get AOC Year', () => {
    it('Should return this year leaderboard if it is December', () => {
      const date = new Date(2024, 11, 1);
      vi.setSystemTime(date);
      const year = getAocYear();
      expect(year).toEqual(2024);
    });

    it('Should return previous year leaderboard if it is not December', () => {
      const date = new Date(2024, 1, 1);
      vi.setSystemTime(date);
      const year = getAocYear();
      expect(year).toEqual(2023);
    });
  });

  describe('Format leaderboard', () => {
    it('Should match the leaderboard format', () => {
      const leaderboardMessage = formatLeaderboard({
        result: parsedMockData,
        updatedAt: mockSystemTime,
      });
      expect(leaderboardMessage).toEqual(`\`\`\`
 #               name score
 1 (anonymous user 4) 474
 2              user2 361
 3              user3 353
 4              user1   0


Last updated at: 25/12/2024 16:00
\`\`\``);
    });
  });

  describe('Command tests', () => {
    it('Should reply with saved leaderboard if it can get one', async () => {
      mockGetSavedLeaderboard.mockResolvedValueOnce({
        result: parsedMockData,
        updatedAt: mockSystemTime,
      });

      await execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith(`\`\`\`
 #               name score
 1 (anonymous user 4) 474
 2              user2 361
 3              user3 353
 4              user1   0


Last updated at: 25/12/2024 16:00
\`\`\``);
    });

    it('Should reply with error if it errors out while finding aoc settings', async () => {
      mockGetSavedLeaderboard.mockResolvedValueOnce({
        result: parsedMockData,
        updatedAt: oneHourEarlier,
      });
      mockGetAocSettings.mockRejectedValueOnce(new Error('Synthetic Error Get Settings'));

      await execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith('ERROR: Error: Synthetic Error Get Settings');
    });

    it('Should reply with error if server is not configured', async () => {
      mockGetSavedLeaderboard.mockResolvedValueOnce({
        result: parsedMockData,
        updatedAt: oneHourEarlier,
      });
      mockGetAocSettings.mockResolvedValueOnce(null);

      await execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith('ERROR: Server is not configured to get AOC results! Missing Key and/or Leaderboard ID.');
    });

    it('Should reply with error if there is one during fetching and saving', async () => {
      mockGetSavedLeaderboard.mockResolvedValueOnce({
        result: parsedMockData,
        updatedAt: oneHourEarlier,
      });
      mockGetAocSettings.mockResolvedValueOnce({
        guildId: '12345',
        aocKey: '12345',
        aocLeaderboardId: '12345',
      });
      mockFetchAndSaveLeaderboard.mockRejectedValueOnce(new Error('Synthetic error fetch and save'));

      await execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        'ERROR: Error fetching and/or saving new leaderboard result: Error: Synthetic error fetch and save'
      );
    });

    it('Should reply with newly fetched leaderboard after fetching and saving', async () => {
      mockGetSavedLeaderboard.mockResolvedValueOnce({
        result: parsedMockData,
        updatedAt: oneHourEarlier,
      });
      mockGetAocSettings.mockResolvedValueOnce({
        guildId: '12345',
        aocKey: '12345',
        aocLeaderboardId: '12345',
      });
      mockFetchAndSaveLeaderboard.mockResolvedValueOnce({
        result: parsedMockData,
        updatedAt: mockSystemTime,
      });

      await execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith(`\`\`\`
 #               name score
 1 (anonymous user 4) 474
 2              user2 361
 3              user3 353
 4              user1   0


Last updated at: 25/12/2024 16:00
\`\`\``);
    });
  });
});
