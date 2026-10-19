import { defineConfig } from '@playwright/test';
const previewUrl = 'http://127.0.0.1:' + (process.env.DSH_INDEX_PREVIEW_PORT ?? process.env.PORT ?? '4173') + '/dsh-plugin-index/';

export default defineConfig({
  testDir: './browser',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.SITE_URL ?? previewUrl,
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
    cwd: '..',
    url: previewUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  }
});
