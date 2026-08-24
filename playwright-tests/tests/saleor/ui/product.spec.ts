import { test, expect } from '@playwright/test';
import { ProductListPage } from '../../../pages/saleor/ProductListPage';
import { ProductDetailPage } from '../../../pages/saleor/ProductDetailPage';

test.describe('Saleor - Product browsing (UI)', () => {
  test('product listing page shows multiple products', async ({ page }) => {
    const list = new ProductListPage(page);
    await list.open();

    await list.expectHasProducts();
    await expect(list.productLinks).not.toHaveCount(0);
  });

  test('product detail page shows a title and purchase action', async ({ page }) => {
    const list = new ProductListPage(page);
    await list.open();
    await list.expectHasProducts();
    await list.openProductByIndex(0);

    const detail = new ProductDetailPage(page);
    await detail.expectLoaded();
    await detail.expectPurchaseCta();
  });

  test('search navigates to a results page and returns matching products', async ({ page }) => {
    const list = new ProductListPage(page);
    await list.open();

    await list.search('shirt');

    // /products already renders product links, so asserting "a link is visible"
    // would pass even if search did nothing. Assert the search actually ran
    // (query in the URL) and that a returned product matches the term.
    await expect(page).toHaveURL(/[?&]q(uery)?=shirt/i);
    await expect(list.productLinks.first()).toBeVisible();
    await expect(list.productLinks.filter({ hasText: /shirt/i })).not.toHaveCount(0);
  });

  test('search for a nonsense term returns no products', async ({ page }) => {
    const list = new ProductListPage(page);
    await list.open();

    await list.search(`zzz-no-such-product-${Date.now()}`);

    await expect(page).toHaveURL(/[?&]q(uery)?=zzz-no-such-product/i);
    await expect(list.productLinks).toHaveCount(0);
  });
});
