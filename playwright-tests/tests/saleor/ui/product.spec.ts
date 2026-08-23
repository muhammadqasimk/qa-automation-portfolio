import { test, expect } from '@playwright/test';
import { ProductListPage } from '../../../pages/saleor/ProductListPage';
import { ProductDetailPage } from '../../../pages/saleor/ProductDetailPage';

test.describe('Saleor - Product browsing (UI)', () => {
  test('product listing page shows multiple products', async ({ page }) => {
    const list = new ProductListPage(page);
    await list.open();

    await list.expectHasProducts();
    expect(await list.count()).toBeGreaterThan(0);
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

  test('search returns product results', async ({ page }) => {
    const list = new ProductListPage(page);
    await list.open();

    await list.search('shirt');

    await expect(page.locator('a[href*="/products/"]').first()).toBeVisible();
  });
});
