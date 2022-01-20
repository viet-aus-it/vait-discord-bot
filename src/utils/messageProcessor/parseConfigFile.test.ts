import fs from 'fs';
import { parseConfigFile, ICommandFileSchema } from './parseConfigFile';

jest.mock('fs');
const mockFs = jest.mocked(fs, true);

const mockConfigContent = (config: ICommandFileSchema) =>
  mockFs.readFileSync.mockReturnValueOnce(JSON.stringify(config));

describe('parseConfigFile', () => {
  it('Should read and parse config file correctly', () => {
    mockConfigContent({ prefix: ';;' });
    const output = parseConfigFile();
    expect(output).toEqual({
      prefix: ';;',
    });
  });

  it('Should replace missing config with default if there are missing fields', () => {
    mockConfigContent({});
    const output = parseConfigFile();
    expect(output).toEqual({
      prefix: '-',
    });
  });

  it('Should return default config if there is no config file', () => {
    mockFs.readFileSync.mockImplementationOnce(() => {
      throw new Error('Synthetic Error');
    });
    const output = parseConfigFile();
    expect(output).toEqual({
      prefix: '-',
    });
  });
});
