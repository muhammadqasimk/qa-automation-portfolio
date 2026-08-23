import { Page, Locator, expect } from '@playwright/test';
import { SaleorBasePage } from './SaleorBasePage';

export class SaleorHomePage extends SaleorBasePage {
  readonly heading: Locator;
  readonly productLinks: Locator;
  readonly categoryLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /Discover our collection/i });
    this.productLinks = page.locator('a[href*="/products/"]');
    this.categoryLinks = page.locator('a[href*="/categories/"]');
  }

  async open(): Promise<void> {
    await this.goto('');
  }

  async openFirstProduct(): Promise<void> {
    await this.productLinks.first().click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.productLinks.first()).toBeVisible();
  }
}
