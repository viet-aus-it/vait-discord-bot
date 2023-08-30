import { describe, expect, it } from 'vitest';
import { getUniqueRandomIntInclusive } from '.';

describe('Random unique number', () => {
  it('should return a unique number that is not in the array', async () => {
    const number = getUniqueRandomIntInclusive([1, 2, 3], 1, 4);
    expect(number).toEqual(4);
  });
});
