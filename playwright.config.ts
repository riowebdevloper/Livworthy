import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
    ...(process.env.CI || process.platform !== 'darwin'
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
        ]
      : []),
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    // Use the dev server. server.ts now serves pre-rendered dist/ pages for institutional
    // routes (/about, /methodology, etc.) before the Vite SPA middleware, so routing
    // regression tests work correctly without needing env vars or a production build server.
    command: 'npx tsx server.ts',
    url: 'http://127.0.0.1:3000/api/health',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
