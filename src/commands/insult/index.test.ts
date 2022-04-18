import faker from '@faker-js/faker';
import { randomCreate } from './insultGenerator';
import { insult } from '.';

const replyMock = jest.fn();

const getStringMock = jest.fn();

const getMockInteraction = (): any => ({
  reply: replyMock,
  options: {
    getString: getStringMock,
  },
});

describe('Insult someone test', () => {
  beforeEach(() => replyMock.mockClear());

  it('Should send an insult when the cmd is sent', async () => {
    getStringMock.mockImplementationOnce(() => '');
    const mockInteraction = getMockInteraction();

    await insult(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should insult the chat content', async () => {
    getStringMock.mockImplementationOnce(() => faker.lorem.words(2));
    const mockInteraction = getMockInteraction();

    await insult(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should throw error if cannot send insult', async () => {
    getStringMock.mockImplementationOnce(() => faker.lorem.words(2));
    replyMock.mockImplementationOnce(async () => {
      throw new Error('Something went wrong');
    });
    const mockInteraction = getMockInteraction();

    await insult(mockInteraction);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });
});

describe('Insult Library test', () => {
  beforeEach(() => replyMock.mockClear());

  it('Should be able to generate a random insult', () => {
    const insultString = randomCreate();
    expect(typeof insultString).toEqual('string');
  });
});
