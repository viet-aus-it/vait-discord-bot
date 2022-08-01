import { it, describe, expect } from 'vitest';
import { getOrCreateUser, updateRep } from './_helpers';

describe('getOrCreateUser', () => {
  it('should return user if user is existed', async () => {
    const user = await getOrCreateUser('1');
    expect(user.id).toBe('1');
  });

  it('should return user even if user is not existed', async () => {
    const user = await getOrCreateUser('1');
    expect(user.id).toBe('1');
  });
});

describe('updateRep', () => {
  const testCases = [
    {
      description: 'Should add a rep to a user',
      adjustment: { reputation: { increment: 1 } },
    },
    {
      description: 'Should remove a rep from a user',
      adjustment: { reputation: { decrement: 1 } },
    },
    {
      description: "Should set a user's rep",
      adjustment: { reputation: { set: 1 } },
    },
  ];

  testCases.forEach(({ description, adjustment }) => {
    it(description, async () => {
      const result = await updateRep({
        fromUserId: '2',
        toUserId: '1',
        adjustment,
      });

      expect(result.reputation).toBe(1);
    });
  });
});
