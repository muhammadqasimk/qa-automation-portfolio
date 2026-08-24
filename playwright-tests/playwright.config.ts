import { defineConfig, devices } from '@playwright/test';

/**
 * Tests run against hosted demo apps (Conduit, Saleor) and the Restful-Booker API.
 * No local web server is started; base URLs live in ./config/urls.ts.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Targets are live, shared public demos. Concurrency is capped so the suite
  // cannot rate-limit itself - unbounded local workers x 3 browser projects
  // produces 429s that surface as unrelated-looking locator failures.
  workers: process.env.CI ? 2 : 4,
  // Budget headroom: navigationTimeout (30s) + the Saleor variant-hydration
  // retry (25s) can legitimately consume 55s on the slowest engine.
  timeout: 90 * 1000,
  expect: { timeout: 10 * 1000 },
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    // API tests are transport-only - no browser needed, so run them once.
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
    },

    // UI and E2E suites run across all three engines.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /tests\/api\/.*\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /tests\/api\/.*\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /tests\/api\/.*\.spec\.ts/,
    },
  ],
});
