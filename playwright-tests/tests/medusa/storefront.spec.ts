import { test, expect } from '@playwright/test';
import { URLS } from '../../config/urls';

/**
 * Medusa.js has no stable public demo, so this suite is opt-in.
 * Provide MEDUSA_URL (storefront base URL) to enable it, e.g.:
 *   MEDUSA_URL=http://localhost:8000 npm run test:medusa
 */
test.describe('Medusa storefront (opt-in)', () => {
  test.skip(!URLS.medusa, 'Set MEDUSA_URL to run the Medusa suite');

  test('storefront home page loads', async ({ page }) => {
    await page.goto(URLS.medusa, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/.+/);
  });

  test('a product listing is reachable', async ({ page }) => {
    await page.goto(`${URLS.medusa}/store`, { waitUntil: 'domcontentloaded' }).catch(async () => {
      await page.goto(URLS.medusa, { waitUntil: 'domcontentloaded' });
    });
    await expect(page.locator('a[href*="product"]').first()).toBeVisible();
  });
});
