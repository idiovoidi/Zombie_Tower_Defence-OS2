export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.test.json'
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^pixi.js$': '<rootDir>/__mocks__/pixi.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@pixi|earcut)/)'
  ],
  extensionsToTreatAsEsm: ['.ts'],
};