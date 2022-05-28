import { autocomplete, execute } from './referralNew';

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

it('should return INVALID_DATE error', () => {
  execute({
    options: {
      getString: (name: string, required: true) => {
        if (name === 'service') return;
        if (name === 'link_or_code') return;
        if (name === 'expiry_date' && required) return 'lol';
      },
    },
    reply: (message: string) => {
      expect(message).toBe('expiry_date is invalid date try format MM/DD/YYYY');
    },
  } as any);
});

it('should return EXPIRED_DATE error', () => {
  execute({
    options: {
      getString: (name: string, required: true) => {
        if (name === 'service') return;
        if (name === 'link_or_code') return;
        if (name === 'expiry_date' && required) return '05/04/1994';
      },
    },
    reply: (message: string) => {
      expect(message).toBe('expiry_date has already expired');
    },
  } as any);
});

// TODO test case for prisma write
