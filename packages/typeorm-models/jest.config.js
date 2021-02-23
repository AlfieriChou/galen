module.exports = {
  testEnvironment: 'node',
  bail: true,
  verbose: true,
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dir/'],
  testMatch: ['<rootDir>/__tests__/?(*.)+(spec|test).js?(x)']
}
