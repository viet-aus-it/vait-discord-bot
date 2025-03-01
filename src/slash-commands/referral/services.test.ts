import { describe, expect, it } from 'vitest';
import { searchServices } from './services';

describe('Service search test', () => {
  it('should return searched options', () => {
    const options = searchServices('heal');

    expect(options).toMatchInlineSnapshot(`
      [
        {
          "name": "ahm health insurance",
          "value": "ahm health insurance",
        },
        {
          "name": "doctors health by avant",
          "value": "doctors health by avant",
        },
        {
          "name": "phoenix health fund",
          "value": "phoenix health fund",
        },
        {
          "name": "qantas insurance - health insurance",
          "value": "qantas insurance - health insurance",
        },
        {
          "name": "queensland country health fund",
          "value": "queensland country health fund",
        },
        {
          "name": "teachers health",
          "value": "teachers health",
        },
        {
          "name": "westfund health insurance",
          "value": "westfund health insurance",
        },
      ]
    `);
  });
});
