/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['./test/expectExtensions.ts'],
};
