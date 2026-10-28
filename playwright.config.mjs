import { defineConfig } from '@playwright/test'

const port = Number(process.env.SAEKI_E2E_PORT ?? 5290)
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid SAEKI_E2E_PORT')
export default defineConfig({
  testDir: './tests/e2e', workers: 1, timeout: 600_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:${port}`, actionTimeout: 10_000, navigationTimeout: 30_000, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'pc', use: { browserName: 'chromium', viewport: { width: 1920, height: 1080 } } },
    { name: 'mobile-landscape', use: { browserName: 'chromium', viewport: { width: 844, height: 390 }, hasTouch: true } },
  ],
  webServer: { command: 'node tools/e2e-server.mjs', url: `http://127.0.0.1:${port}`, env: { SAEKI_E2E_PORT: String(port) }, reuseExistingServer: false, timeout: 60_000 },
})
