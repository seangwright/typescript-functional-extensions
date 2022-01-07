import { InitialOptionsTsJest } from 'ts-jest';

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: './test/tsconfig.json',
    },
  },
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['./test/expectExtensions.ts'],
  extensionsToTreatAsEsm: ['.ts'],
};

export default config;
