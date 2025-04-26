import { faker } from '@faker-js/faker';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { execute } from './set-aoc-settings';
import { setAocSettings } from './utils';

vi.mock('./utils');
const mockSetAocSettings = vi.mocked(setAocSettings);
const mockKey = faker.string.alphanumeric({ length: 127 });
const mockLeaderboardId = faker.string.alphanumeric();

describe('Set aoc key', () => {
  chatInputCommandInteractionTest('should reply with error if it cannot set the key', async ({ interaction }) => {
    mockSetAocSettings.mockRejectedValueOnce(new Error('Synthetic Error save aoc settings'));
    interaction.options.getString.mockImplementation((name) => {
      switch (name) {
        case 'key': {
          return mockKey;
        }

        case 'leaderboard-id': {
          return mockLeaderboardId;
        }

        default:
          return '';
      }
    });

    await execute(interaction);

    expect(mockSetAocSettings).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Cannot set this AOC key. Please try again. Error: Error: Synthetic Error save aoc settings');
  });

  chatInputCommandInteractionTest('Should be able to set AOC key and reply', async ({ interaction }) => {
    mockSetAocSettings.mockResolvedValueOnce({
      guildId: faker.string.numeric(),
      aocLeaderboardId: faker.string.numeric(),
    });
    interaction.options.getString.mockImplementation((name) => {
      switch (name) {
        case 'key': {
          return mockKey;
        }

        case 'leaderboard-id': {
          return mockLeaderboardId;
        }

        default:
          return '';
      }
    });

    await execute(interaction);

    expect(mockSetAocSettings).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Successfully saved setting. You can now get AOC Leaderboard.');
  });
});
