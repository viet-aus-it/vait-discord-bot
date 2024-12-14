import { faker } from '@faker-js/faker';
import type { ChatInputCommandInteraction } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { execute } from './set-aoc-settings';
import { setAocSettings } from './utils';

vi.mock('./utils');
const mockSetAocSettings = vi.mocked(setAocSettings);
const mockChatInputInteraction = mockDeep<ChatInputCommandInteraction>();
const mockKey = faker.string.alphanumeric({ length: 127 });
const mockLeaderboardId = faker.string.alphanumeric();

describe('Set aoc key', () => {
  beforeEach(() => {
    mockReset(mockChatInputInteraction);
  });

  it('should reply with error if it cannot set the key', async () => {
    mockSetAocSettings.mockRejectedValueOnce(new Error('Synthetic Error save aoc settings'));
    mockChatInputInteraction.options.getString.mockImplementation((name) => {
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

    await execute(mockChatInputInteraction);

    expect(mockSetAocSettings).toHaveBeenCalledOnce();
    expect(mockChatInputInteraction.reply).toHaveBeenCalledOnce();
    expect(mockChatInputInteraction.reply).toHaveBeenCalledWith('Cannot set this AOC key. Please try again. Error: Error: Synthetic Error save aoc settings');
  });

  it('Should be able to set AOC key and reply', async () => {
    mockSetAocSettings.mockResolvedValueOnce({
      guildId: faker.string.numeric(),
      aocLeaderboardId: faker.string.numeric(),
    });
    mockChatInputInteraction.options.getString.mockImplementation((name) => {
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

    await execute(mockChatInputInteraction);

    expect(mockSetAocSettings).toHaveBeenCalledOnce();
    expect(mockChatInputInteraction.reply).toHaveBeenCalledOnce();
    expect(mockChatInputInteraction.reply).toHaveBeenCalledWith('Successfully saved setting. You can now get AOC Leaderboard.');
  });
});
