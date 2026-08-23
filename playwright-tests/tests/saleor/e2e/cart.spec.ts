import { test, expect } from '@playwright/test';
import { ProductDetailPage } from '../../../pages/saleor/ProductDetailPage';

/**
 * End-to-end shopping flow against the live Saleor demo:
 * open a known multi-variant product -> pick a size -> add to cart -> verify the cart count.
 */
test.describe('Saleor - Add to cart (E2E)', () => {
  test('adding a product updates the cart', async ({ page }) => {
    const detail = new ProductDetailPage(page);
    await detail.openBySlug('dark-polygon-tee');
    await detail.expectLoaded();

    await detail.addToCart();

    // The cart indicator should reflect at least one item after adding.
    await expect(page.getByText(/[1-9]\d* item/i).first()).toBeVisible();
  });
});
