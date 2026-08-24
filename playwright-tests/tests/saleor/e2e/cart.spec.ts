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

    // Cart starts empty, so the assertion below can only pass because of this step.
    await expect(detail.cartButton).toHaveAccessibleName(/0 items? in cart/i);

    await detail.addToCart();

    // Adding to the cart fires a GraphQL mutation before the header updates, so
    // this is given a longer budget than the default expect timeout - WebKit is
    // consistently the slowest of the three engines to reflect it.
    await expect(detail.cartButtonWithItems).toBeVisible({ timeout: 25000 });
  });
});
