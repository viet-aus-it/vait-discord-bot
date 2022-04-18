import { danhSomeone } from '.';

const replyMock = jest.fn();
const getUserMock = jest.fn(
  (param: `target${number}`): { id: string } | undefined => {
    return {
      id: param.substring(6),
    };
  }
);

describe('danhSomeone', () => {
  beforeEach(() => {
    replyMock.mockReset();
    getUserMock.mockReset();
  });

  it('should hit all mentioned users with random damages', () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getUser: getUserMock,
      },
      client: {
        user: {
          id: '1',
        },
      },
      member: {
        user: {
          id: '2',
        },
      },
    };

    danhSomeone(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('should not allow user to hit bot', () => {
    getUserMock.mockImplementation((param: `target${number}`) => {
      if (param === 'target1') return { id: '1' };
    });
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getUser: getUserMock,
      },
      client: {
        user: {
          id: '1',
        },
      },
      member: {
        user: {
          id: '2',
        },
      },
    };

    danhSomeone(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      "<@2>, I'm your father, you can't hit me."
    );
  });

  it('should not allow user to hit themself', () => {
    getUserMock.mockImplementation((param: `target${number}`) => {
      if (param === 'target1') return { id: '2' };
    });
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getUser: getUserMock,
      },
      client: {
        user: {
          id: '1',
        },
      },
      member: {
        user: {
          id: '2',
        },
      },
    };

    danhSomeone(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(
      'Stop hitting yourself <@2>, hit someone else.'
    );
  });
});
