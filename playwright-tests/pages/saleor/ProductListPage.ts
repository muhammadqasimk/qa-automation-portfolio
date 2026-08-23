import { Page, Locator, expect } from '@playwright/test';
import { SaleorBasePage } from './SaleorBasePage';

export class ProductListPage extends SaleorBasePage {
  readonly productLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.productLinks = page.locator('a[href*="/products/"]');
  }

  async open(): Promise<void> {
    await this.goto('/products');
  }

  async count(): Promise<number> {
    return this.productLinks.count();
  }

  async openProductByIndex(index = 0): Promise<void> {
    await this.productLinks.nth(index).click();
  }

  async expectHasProducts(): Promise<void> {
    await expect(this.productLinks.first()).toBeVisible();
  }
}
