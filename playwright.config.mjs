import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/browser',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.SITE_URL ?? 'http://127.0.0.1:4173/dsh-plugin-index/',
    headless: true,
    launchOptions: process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {},
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: process.env.SITE_URL ? undefined : {
    command: 'node scripts/preview.mjs',
    url: 'http://127.0.0.1:4173/dsh-plugin-index/',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  }
});
