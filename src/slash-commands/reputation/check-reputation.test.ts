import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { checkReputation } from './check-reputation';
import { getOrCreateUser } from './utils';

vi.mock('./utils');
const mockGetOrCreateUser = vi.mocked(getOrCreateUser);

describe('checkReputation', () => {
  chatInputCommandInteractionTest('should send reply if message is "-rep"', async ({ interaction }) => {
    mockGetOrCreateUser.mockResolvedValueOnce({
      id: '1',
      reputation: 0,
    });
    interaction.member!.user.id = '1';

    await checkReputation(interaction);

    expect(mockGetOrCreateUser).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
  });
});
