import { ChatInputCommandInteraction } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { getOrCreateUser } from './_helpers';
import { checkReputation } from './checkReputation';

vi.mock('./_helpers');
const mockGetOrCreateUser = vi.mocked(getOrCreateUser);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('checkReputation', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('should send reply if message is "-rep"', async () => {
    mockGetOrCreateUser.mockResolvedValueOnce({
      id: '1',
      reputation: 0,
    });
    mockInteraction.member!.user.id = '1';

    await checkReputation(mockInteraction);

    expect(mockGetOrCreateUser).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });
});
