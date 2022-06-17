import { getPrismaClient } from '../../clients';
import { autocomplete, execute } from './referralRandom';

jest.mock('../../clients');
const mockGetPrismaClient = jest.mocked(getPrismaClient);

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

    // expect response
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
    };

    autocomplete({ options, respond } as any);
  });
});

describe('execute', () => {
  it('should return found no code message when no code match', () => {
    const messageIn = { service: 'NOt exIsted servIce    ' };

    mockGetPrismaClient.mockReturnValueOnce({
      referralCode: {
        findMany: ({ where }: any) => {
          expect(where.service.contains).toBe(
            messageIn.service.trim().toLowerCase()
          );
          return [];
        },
      },
    } as any);

    // mock input options
    const options = {
      getString: (name: string) => {
        if (name === 'service') return messageIn.service;
      },
    };

    // expect response
    const reply = (message: string) => {
      expect(message).toBe(
        `There is no code for ${messageIn.service.trim().toLowerCase()} service`
      );
    };

    execute({ options, reply } as any);
  });

  it('should return found no code message when code expired', () => {
    const messageIn = { service: 'some service' };

    mockGetPrismaClient.mockReturnValueOnce({
      referralCode: {
        findMany: ({ where }: any) => {
          expect(where.service.contains).toBe(
            messageIn.service.trim().toLowerCase()
          );
          return [
            {
              id: 1,
              code: 'SomeCode',
              expiry_date: '05/04/1994',
            },
          ];
        },
      },
    } as any);

    // mock input options
    const options = {
      getString: (name: string) => {
        if (name === 'service') return messageIn.service;
      },
    };

    const reply = (message: string) => {
      expect(message).toBe(
        `There is no code for ${messageIn.service.trim().toLowerCase()} service`
      );
    };

    execute({ options, reply } as any);
  });

  it('should return code if found', () => {
    const messageIn = { service: 'some service' };
    const code = 'SomeCode';
    const expiryDate = new Date(`05/04/${new Date().getFullYear() + 1}`);

    mockGetPrismaClient.mockReturnValueOnce({
      referralCode: {
        findMany: ({ where }: any) => {
          expect(where.service.contains).toBe(
            messageIn.service.trim().toLowerCase()
          );
          return [
            {
              id: 1,
              code,
              expiry_date: expiryDate,
            },
          ];
        },
      },
    } as any);

    // mock input options
    const options = {
      getString: (name: string) => {
        if (name === 'service') return messageIn.service;
      },
    };

    // expect response
    const reply = (message: string) => {
      expect(message).toBe(
        `Service ${messageIn.service.trim().toLowerCase()}: ${code}`
      );
    };

    execute({ options, reply } as any);
  });
});

// TODO should do clean up when there are lots of expired code

// TODO should not throw if network error happen when clean expired code
