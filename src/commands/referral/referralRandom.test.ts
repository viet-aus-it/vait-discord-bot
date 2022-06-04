import { getPrismaClient } from '../../clients';
import { autocomplete, execute } from './referralRandom';

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

    execute({
      options: {
        getString: (name: string) => {
          if (name === 'service') return messageIn.service;
        },
      },
      reply: (message: string) => {
        expect(message).toBe(
          `There is no code for ${messageIn.service
            .trim()
            .toLowerCase()} service`
        );
      },
    } as any);
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

    execute({
      options: {
        getString: (name: string) => {
          if (name === 'service') return messageIn.service;
        },
      },
      reply: (message: string) => {
        expect(message).toBe(
          `There is no code for ${messageIn.service
            .trim()
            .toLowerCase()} service`
        );
      },
    } as any);
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

    execute({
      options: {
        getString: (name: string) => {
          if (name === 'service') return messageIn.service;
        },
      },
      reply: (message: string) => {
        expect(message).toBe(
          `Service ${messageIn.service.trim().toLowerCase()}: ${code}`
        );
      },
    } as any);
  });
});

// TODO should do clean up when there are lots of expired code

// TODO should not throw if network error happen when clean expired code
