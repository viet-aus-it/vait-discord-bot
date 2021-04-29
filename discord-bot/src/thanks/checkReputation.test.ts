import { checkReputation } from './checkReputation';

const replyMock = jest.fn(() => {});
const findUniqueMock = jest.fn(() => ({ id: '1' }));

it('should do nothing if message is not "-rep"', async () => {
  const messageMock: any = {
    content: 'weeee',
    reply: replyMock,
  };
  const primsaMock: any = {};

  await checkReputation(messageMock, primsaMock);

  expect(replyMock.mock.calls.length).toBe(0);
});

it('should send reply if message is "-rep"', async () => {
  const messageMock: any = {
    content: '-rep',
    author: { id: '1' },
    reply: replyMock,
  };
  const primsaMock: any = {
    user: { findUnique: findUniqueMock },
  };

  await checkReputation(messageMock, primsaMock);

  expect(findUniqueMock.mock.calls.length).toBe(1);
  expect(replyMock.mock.calls.length).toBe(1);
});
