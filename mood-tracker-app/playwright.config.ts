import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  // CI環境用のタイムアウト設定
  timeout: process.env.CI ? 60000 : 30000, // テスト全体: 60秒
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    
    // アクションのタイムアウトを延長
    actionTimeout: process.env.CI ? 15000 : 10000, // 15秒
    navigationTimeout: process.env.CI ? 30000 : 20000, // 30秒
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