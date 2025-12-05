import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  // グローバルセットアップ（全テスト実行前に1回だけ実行）
  globalSetup: './tests/setup/global-setup.ts',
  
  // CI環境用のタイムアウト設定（コード分割対応で延長）
  timeout: 60000, // テスト全体: 60秒（コード分割対応）
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    
    // アクションのタイムアウトを延長（コード分割対応）
    actionTimeout: 15000, // 15秒（コード分割対応）
    navigationTimeout: 30000, // 30秒
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // サーバー起動待機: 120秒
    env: {
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
    },
  },
});