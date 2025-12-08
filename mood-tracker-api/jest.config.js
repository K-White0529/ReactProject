// テスト環境の環境変数を最初に設定
process.env.NODE_ENV = 'test';
process.env.DISABLE_CSRF = 'true';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
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
  // グローバルセットアップ
  globals: {
    'process.env': {
      NODE_ENV: 'test',
      DISABLE_CSRF: 'true'
    }
  }
};
