/** @type import('@jest/types').Config.InitialOptions */
const config = {
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  cache: true,
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  modulePaths: ['<rootDir>/src/'],
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/*.setup.ts',
    '<rootDir>/src/utils/random/*',
    '<rootDir>/src/mocks/*',
    '<rootDir>/src/clients/*',
  ],
  modulePathIgnorePatterns: ['<rootDir>/build'],
};

module.exports = config;
