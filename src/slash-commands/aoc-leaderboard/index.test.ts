import { faker } from '@faker-js/faker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captor } from 'vitest-mock-extended';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import type { JsonValue } from '../../clients/prisma/generated/client/runtime/library';
import { setAocSettings } from '../server-settings/utils';
import { execute, formatLeaderboard, getAocYear } from '.';
import mockAocData from './sample/aoc-data.json';
import { AocLeaderboard } from './schema';
import { deleteLeaderboard, saveLeaderboard } from './utils';

const parsedMockData = AocLeaderboard.parse(mockAocData);
const mockKey = faker.string.alphanumeric({ length: 127 });
const mockLeaderboardId = faker.string.alphanumeric();

const mockSystemTime = new Date(2024, 11, 25, 16, 0, 0); // 25/12/2024 16:00:00

describe('Get AOC Leaderboard test', () => {
  describe('Static time tests', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(mockSystemTime);
    });

    afterEach(() => {
      vi.runAllTimers();
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
          result: parsedMockData as JsonValue,
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
  });

  describe('Command tests', () => {
    chatInputCommandInteractionTest('Should reply with saved leaderboard if it can get one', async ({ interaction }) => {
      await saveLeaderboard(interaction.guildId!, parsedMockData);

      await execute(interaction);

      const message = captor<string>();
      expect(interaction.editReply).toHaveBeenCalledWith(message);
      expect(message.value).toContain(`
 #               name score
 1 (anonymous user 4) 474
 2              user2 361
 3              user3 353
 4              user1   0
`);

      await deleteLeaderboard(interaction.guildId!);
    });

    chatInputCommandInteractionTest('Should reply with error if server is not configured', async ({ interaction }) => {
      await execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith('ERROR: Server is not configured to get AOC results! Missing Key and/or Leaderboard ID.');
    });

    chatInputCommandInteractionTest('Should reply with newly fetched leaderboard after fetching and saving', async ({ interaction }) => {
      await setAocSettings(interaction.guildId!, mockKey, mockLeaderboardId);

      await execute(interaction);

      const message = captor<string>();
      expect(interaction.editReply).toHaveBeenCalledWith(message);
      expect(message.value).toContain(`
 #               name score
 1 (anonymous user 4) 474
 2              user2 361
 3              user3 353
 4              user1   0
`);
    });
  });
});
