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
  /** Header cart control. The item count lives in its accessible name
   *  ("0 items in cart, view bag"), not in a visible text node, so it must be
   *  matched by role + name rather than with getByText. */
  readonly cartButton: Locator;
  /** Same control, but only matches once the cart holds at least one item. */
  readonly cartButtonWithItems: Locator;

  protected constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/Search for products/i);
    this.cartLink = page.getByRole('link', { name: /cart|bag/i }).first();
    this.loginLink = page.getByRole('link', { name: /Log in/i });
    this.cartButton = page.getByRole('button', { name: /items? in cart/i });
    this.cartButtonWithItems = page.getByRole('button', {
      name: /[1-9]\d* items? in cart/i,
    });
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
