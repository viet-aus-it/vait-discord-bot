import { getDisclaimer } from '.';

const replyMock = jest.fn();

describe('get disclaimer test', () => {
  it('Should return the disclaimer text', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: jest.fn(() => ''),
      },
    };

    await getDisclaimer(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
  it('Should return the EN disclaimer text', async () => {
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: jest.fn(() => 'en'),
      },
    };

    await getDisclaimer(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});
