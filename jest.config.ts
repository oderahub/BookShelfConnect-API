// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  verbose: true,
  // Remove or adjust moduleNameMapper based on your mock location
  moduleNameMapper: {
    // If keeping the mock at __mocks__/quikdb-cli-beta/v1/sdk.ts (recommended):
    '^quikdb-cli-beta/v1/sdk$': '<rootDir>/__mocks__/quikdb.ts',
    // For TypeScript imports
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  // Additional useful options
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  // Improve test timeout for integration tests
  testTimeout: 30000,
  // Collect coverage if desired
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/test/', '/__mocks__/']
}
