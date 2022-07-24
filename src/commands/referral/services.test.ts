import { it, expect } from '@jest/globals';
import { searchServices } from './services';

it('should return searched options', () => {
  const options = searchServices('heal');

  expect(options).toMatchInlineSnapshot(`
    Array [
      Object {
        "name": "ahm health insurance",
        "value": "ahm health insurance",
      },
      Object {
        "name": "doctors' health fund",
        "value": "doctors' health fund",
      },
      Object {
        "name": "phoenix health fund",
        "value": "phoenix health fund",
      },
      Object {
        "name": "qantas insurance - health insurance",
        "value": "qantas insurance - health insurance",
      },
      Object {
        "name": "westfund health insurance",
        "value": "westfund health insurance",
      },
    ]
  `);
});
