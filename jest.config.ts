import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  cache: true,
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  modulePaths: ['<rootDir>/src/'],
  setupFilesAfterEnv: [
    'jest-mock-console/dist/setupTestFramework.js',
    '<rootDir>/src/jest.setup.ts',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/*.setup.ts',
    '<rootDir>/src/utils/mockDiscord/*',
    '<rootDir>/src/utils/random/*',
    '<rootDir>/src/mocks/*',
    '<rootDir>/src/clients/*',
  ],
  modulePathIgnorePatterns: ['<rootDir>/build'],
};

export default config;
