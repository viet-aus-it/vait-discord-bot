import { vi, it, describe, expect } from 'vitest';
import { autocomplete, execute } from './referralNew';
import { getPrismaClient } from '../../clients';
import { services } from './services';

vi.mock('../../clients');
const mockGetPrismaClient = vi.mocked(getPrismaClient);

describe('autocomplete', () => {
  it('should return nothing if the search term shorter than 4', () => {
    // mock input options
    const options = {
      getString: (name: string, required: true) => {
        expect(name).toBe('service');
        expect(required).toBe(true);
        return 'solve';
      },
    };

    // expect response
    const respond = (opts: any[]) => {
      expect(opts).toHaveLength(1);
    };

    autocomplete({ options, respond } as any);
  });

  it('should return nothing if no options found', () => {
    // mock input options
    const options = {
      getString: (name: string, required: true) => {
        expect(name).toBe('service');
        expect(required).toBe(true);
        return 'some random search that not existed';
      },
    };

    // expect respone
    const respond = (opts: any[]) => {
      expect(opts).toHaveLength(0);
    };

    autocomplete({ options, respond } as any);
  });

  it('should return some options if search term longer than 4 and found', () => {
    // mock input options
    const options = {
      getString: (name: string, required: true) => {
        expect(name).toBe('service');
        expect(required).toBe(true);
        return 'heal';
      },
    };

    // expect response
    const respond = (opts: any[]) => {
      expect(opts).toMatchInlineSnapshot(`
        [
          {
            "name": "ahm health insurance",
            "value": "ahm health insurance",
          },
          {
            "name": "doctors' health fund",
            "value": "doctors' health fund",
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
            "name": "westfund health insurance",
            "value": "westfund health insurance",
          },
        ]
      `);
    };

    autocomplete({ options, respond } as any);
  });
});

describe('execute', () => {
  it('should return no service error if service is not in services list', () => {
    const service = 'not in the list';

    // mock input options
    const options = {
      getString: (name: string, required: true) => {
        if (name === 'service') return service;
        if (name === 'link_or_code') return;
        if (name === 'expiry_date' && required) return 'lol';
      },
    };

    // expect response
    const reply = (message: string) => {
      expect(message).toBe(
        `No service named ${service}, ask the admin to add it`
      );
    };

    execute({ options, reply } as any);
  });

  it('should return INVALID_DATE error', () => {
    // mock input options
    const options = {
      getString: (name: string, required: true) => {
        if (name === 'service') return services[0];
        if (name === 'link_or_code') return;
        if (name === 'expiry_date' && required) return 'lol';
      },
    };

    // expect response
    const reply = (message: string) => {
      expect(message).toBe('expiry_date is invalid date try format DD/MM/YYYY');
    };

    execute({ options, reply } as any);
  });

  it('should return EXPIRED_DATE error', () => {
    // mock input
    const input: { [name: string]: any } = {
      service: services[0],
      link_or_code: undefined,
      expiry_date: '05/04/1994',
    };
    const options = {
      getString: (name: string) => input[name],
    };

    // expect reply
    const reply = (message: string) => {
      expect(message).toBe('expiry_date has already expired');
    };

    execute({ options, reply } as any);
  });

  it('should create a new referral code', () => {
    const data = {
      service: services[0],
      code: 'SomeCodeHere',
      expiry_date: `04/04/${new Date().getFullYear() + 1}`,
    };

    const mockPrisma: any = {
      referralCode: {
        create: (input: any) => {
          expect(input.data.service).toBe(data.service);
          expect(input.data.code).toBe(data.code);
          expect(input.data.expiry_date.toISOString()).toBe(
            new Date(data.expiry_date).toISOString()
          );

          return {
            service: data.service,
            code: data.code,
            expiry_date: new Date(data.expiry_date),
          };
        },
      },
    };
    mockGetPrismaClient.mockReturnValueOnce(mockPrisma);

    // mock input options
    const options = {
      getString: (name: string, required: true) => {
        if (name === 'service') return data.service;
        if (name === 'link_or_code') return data.code;
        if (name === 'expiry_date' && required) return data.expiry_date;
      },
    };

    // expect response
    const reply = (message: string) => {
      expect(message).toContain(
        'new SomeCodeHere in chope.co - chope phuket expired'
      );
    };

    execute({ options, reply } as any);
  });
});
