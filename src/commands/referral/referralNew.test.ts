import { autocomplete, execute } from './referralNew';
import { getPrismaClient } from '../../clients';
import { services } from './services';

jest.mock('../../clients');
const mockGetPrismaClient = jest.mocked(getPrismaClient);

describe('autocomplete', () => {
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
});

describe('execute', () => {
  it('should return no service error if service is not in services list', () => {
    const service = 'not in the list';
    execute({
      options: {
        getString: (name: string, required: true) => {
          if (name === 'service') return service;
          if (name === 'link_or_code') return;
          if (name === 'expiry_date' && required) return 'lol';
        },
      },
      reply: (message: string) => {
        expect(message).toBe(
          `No service named ${service}, ask the admin to add it`
        );
      },
    } as any);
  });

  it('should return INVALID_DATE error', () => {
    execute({
      options: {
        getString: (name: string, required: true) => {
          if (name === 'service') return services[0];
          if (name === 'link_or_code') return;
          if (name === 'expiry_date' && required) return 'lol';
        },
      },
      reply: (message: string) => {
        expect(message).toBe(
          'expiry_date is invalid date try format MM/DD/YYYY'
        );
      },
    } as any);
  });

  it('should return EXPIRED_DATE error', () => {
    execute({
      options: {
        getString: (name: string, required: true) => {
          if (name === 'service') return services[0];
          if (name === 'link_or_code') return;
          if (name === 'expiry_date' && required) return '05/04/1994';
        },
      },
      reply: (message: string) => {
        expect(message).toBe('expiry_date has already expired');
      },
    } as any);
  });

  it('should create a new referral code', () => {
    const data = {
      service: services[0],
      code: 'SomeCodeHere',
      expiry_date: `05/04/${new Date().getFullYear() + 1}`,
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

    execute({
      options: {
        getString: (name: string, required: true) => {
          if (name === 'service') return data.service;
          if (name === 'link_or_code') return data.code;
          if (name === 'expiry_date' && required) return data.expiry_date;
        },
      },
      reply: (message: string) => {
        expect(message).toContain(
          'new SomeCodeHere in chope.co - chope phuket expired on Thu May 04'
        );
      },
    } as any);
  });
});
