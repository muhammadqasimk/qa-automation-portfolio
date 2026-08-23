import { test, expect } from '@playwright/test';
import { SaleorHomePage } from '../../../pages/saleor/SaleorHomePage';

test.describe('Saleor - Home page (UI)', () => {
  test('loads featured products and categories', async ({ page }) => {
    const home = new SaleorHomePage(page);
    await home.open();

    await home.expectLoaded();
    expect(await home.productLinks.count()).toBeGreaterThan(0);
  });

  test('shows the shop-by-category section', async ({ page }) => {
    const home = new SaleorHomePage(page);
    await home.open();

    await expect(home.categoryLinks.first()).toBeVisible();
  });

  test('navigates to a product detail page from the home grid', async ({ page }) => {
    const home = new SaleorHomePage(page);
    await home.open();
    await home.expectLoaded();

    await home.openFirstProduct();

    await expect(page).toHaveURL(/\/products\//);
  });
});
