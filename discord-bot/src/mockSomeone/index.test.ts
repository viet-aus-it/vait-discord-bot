import faker from 'faker';
import mockSomeone from '.';

const replyMock = jest.fn(() => {});

describe('mockSomeone test', () => {
  beforeEach(() => {
    replyMock.mockClear();
  });

  it("Should exit if chat doesn't have mock prefix", async () => {
    const mockMsg: any = {
      content: faker.lorem.words(25),
      channel: { send: replyMock },
    };

    await mockSomeone(mockMsg);
    expect(replyMock.mock.calls.length).toBe(0);
  });

  it('Should mock text if it has -mock prefix', async () => {
    const mockMsg: any = {
      content: `-mock ${faker.lorem.words(25)}`,
      channel: { send: replyMock },
    };

    await mockSomeone(mockMsg);
    expect(replyMock.mock.calls.length).toBe(1);
  });
});
