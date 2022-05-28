import { autocomplete } from './referralRandom';

it('should return nothing if the search term shorter than 4', () => {
  autocomplete({
    options: {
      getString: (name: string, required: true) => {
        expect(name).toBe('service');
        expect(required).toBe(true);
        return 'so';
      },
    },
    respond: (options: any[]) => {
      expect(options).toHaveLength(0);
    },
  } as any);
});

it('should return nothing if no options found', () => {
  autocomplete({
    options: {
      getString: (name: string, required: true) => {
        expect(name).toBe('service');
        expect(required).toBe(true);
        return 'some random search that not existed';
      },
    },
    respond: (options: any[]) => {
      expect(options).toHaveLength(0);
    },
  } as any);
});

it('should return some options if search term longer than 4 and found', () => {
  autocomplete({
    options: {
      getString: (name: string, required: true) => {
        expect(name).toBe('service');
        expect(required).toBe(true);
        return 'heal';
      },
    },
    respond: (options: any[]) => {
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
    },
  } as any);
});

// TODO should return message when nothing found

// TODO should return code when found

// TODO should do clean up when there are lots of expired code

// TODO should not throw if network error happen when clean expired code
