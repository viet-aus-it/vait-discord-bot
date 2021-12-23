import { Config } from '@jest/types';

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
};

export default config;
