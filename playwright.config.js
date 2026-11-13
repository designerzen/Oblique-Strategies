import { defineConfig, devices } from '@playwright/test'

const development = process.env.TEST_DEV === '1'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4173/Oblique-Strategies/', reducedMotion: 'reduce' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone SE'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: `npm run ${development ? 'dev' : 'preview'} -- --host 127.0.0.1 --port 4173 --strictPort --base /Oblique-Strategies/`,
    url: 'http://127.0.0.1:4173/Oblique-Strategies/',
    reuseExistingServer: false,
  },
})
