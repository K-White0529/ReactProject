// テスト環境の環境変数を最初に設定（最も重要）
process.env.NODE_ENV = 'test';
process.env.DISABLE_CSRF = 'true';

console.log('[Jest Config] Setting up test environment');
console.log('[Jest Config] NODE_ENV:', process.env.NODE_ENV);
console.log('[Jest Config] DISABLE_CSRF:', process.env.DISABLE_CSRF);

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'setup.ts',
    'jest.config.js'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        types: ['jest', 'node'],
        esModuleInterop: true,
        skipLibCheck: true
      }
    }]
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  // テストタイムアウトを延長
  testTimeout: 30000,
  // グローバル変数として環境変数を設定
  globals: {
    'process.env': {
      NODE_ENV: 'test',
      DISABLE_CSRF: 'true'
    }
  }
};
