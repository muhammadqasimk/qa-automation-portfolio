import { Page, Locator } from '@playwright/test';
import { URLS } from '../../config/urls';

/** Shared behaviour for Saleor storefront page objects (channel: /en/default). */
export abstract class SaleorBasePage {
  protected readonly page: Page;
  protected readonly baseUrl = URLS.saleor;
  protected readonly channelPath = '/en/default';

  readonly searchInput: Locator;
  readonly cartLink: Locator;
  readonly loginLink: Locator;

  protected constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/Search for products/i);
    this.cartLink = page.getByRole('link', { name: /cart|bag/i }).first();
    this.loginLink = page.getByRole('link', { name: /Log in/i });
  }

  async goto(path = ''): Promise<void> {
    await this.page.goto(`${this.baseUrl}${this.channelPath}${path}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }
}
