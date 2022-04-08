import { Config } from '@jest/types';
import { defaults as tsjPreset } from 'ts-jest/presets';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  modulePaths: ['<rootDir>/src/'],
  setupFilesAfterEnv: [
    'jest-mock-console/dist/setupTestFramework.js',
    '<rootDir>/src/jest.setup.ts',
  ],
  modulePathIgnorePatterns: ['<rootDir>/build'],
  transform: {
    ...tsjPreset.transform,
    '^.+\\.tsx?$': '@swc/jest',
  },
};

export default config;
