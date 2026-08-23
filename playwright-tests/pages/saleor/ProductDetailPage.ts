import { Page, Locator, expect } from '@playwright/test';
import { SaleorBasePage } from './SaleorBasePage';

export class ProductDetailPage extends SaleorBasePage {
  readonly title: Locator;
  readonly addToCartButton: Locator;
  readonly selectOptionsButton: Locator;
  readonly sizeOptions: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 }).first();
    this.addToCartButton = page.getByRole('button', { name: /add to (cart|bag)/i });
    this.selectOptionsButton = page.getByRole('button', { name: /select options/i });
    // Variant option buttons expose accessible names like "Size M" or "Shoe size 40".
    this.sizeOptions = page.getByRole('button', {
      name: /^(Size|Shoe size) /,
    });
  }

  async openBySlug(slug: string): Promise<void> {
    await this.goto(`/products/${slug}`);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  /** A product always exposes either an "Add to cart" or a "Select options" CTA. */
  async expectPurchaseCta(): Promise<void> {
    await expect(this.addToCartButton.or(this.selectOptionsButton).first()).toBeVisible();
  }

  async addToCart(): Promise<void> {
    if ((await this.sizeOptions.count()) > 0) {
      // The storefront hydrates after render; retry selecting a size until the
      // CTA switches to an enabled "Add to bag" button.
      await expect(async () => {
        await this.sizeOptions.first().click();
        await expect(this.addToCartButton).toBeEnabled({ timeout: 2000 });
      }).toPass({ timeout: 20000 });
    } else {
      await expect(this.addToCartButton).toBeEnabled();
    }
    await this.addToCartButton.click();
  }
}
