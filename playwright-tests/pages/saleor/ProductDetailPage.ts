import { Page, Locator, expect } from '@playwright/test';
import { SaleorBasePage } from './SaleorBasePage';

export class ProductDetailPage extends SaleorBasePage {
  readonly title: Locator;
  readonly addToCartButton: Locator;
  readonly selectOptionsButton: Locator;
  readonly purchaseCta: Locator;
  readonly cartButton: Locator;
  readonly cartButtonWithItems: Locator;
  readonly sizeOptions: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 }).first();
    this.addToCartButton = page.getByRole('button', { name: /add to (cart|bag)/i });
    this.selectOptionsButton = page.getByRole('button', { name: /select options/i });
    // The PDP renders a single CTA that relabels itself: it starts as a disabled
    // "Select options" and becomes an enabled "Add to bag" once a variant is
    // chosen. Matching either label lets assertions target the CTA's *state*
    // rather than whichever copy the storefront is currently showing.
    this.purchaseCta = page.getByRole('button', {
      name: /add to (cart|bag)|select options/i,
    });
    this.cartButton = page.getByRole('button', { name: /items? in cart, view bag/i });
    this.cartButtonWithItems = page.getByRole('button', {
      name: /[1-9]\d* items? in cart, view bag/i,
    });
    // Variant option buttons expose accessible names like "Size M" or "Shoe size 40".
    this.sizeOptions = page.getByRole('button', {
      name: /^(Size|Shoe size) /,
    });
  }

  async openBySlug(slug: string): Promise<void> {
    await this.goto(`/products/${slug}`);
    // The variant buttons are server-rendered and already enabled, so a click
    // can land before React hydrates and be discarded on re-render. Waiting for
    // the network to settle makes the first click succeed on the slower engines
    // instead of relying on the retry below.
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  /** A product always exposes a purchase CTA, whichever label it currently has. */
  async expectPurchaseCta(): Promise<void> {
    await expect(this.purchaseCta).toBeVisible();
  }

  async addToCart(): Promise<void> {
    await expect(this.purchaseCta).toBeVisible();

    if ((await this.sizeOptions.count()) > 0) {
      // Documented cross-browser race: the variant buttons ship server-rendered
      // and already enabled, so a click that lands before hydration is silently
      // discarded when React re-renders. Firefox loses this race most often.
      // The guard re-clicks only while the CTA is still disabled, so a click
      // that did register is never repeated (each one pushes a ?variant= param).
      await expect(async () => {
        if (!(await this.purchaseCta.isEnabled())) {
          await this.sizeOptions.first().click();
        }
        await expect(this.purchaseCta).toBeEnabled({ timeout: 3000 });
      }).toPass({ timeout: 25000 });
    } else {
      await expect(this.purchaseCta).toBeEnabled({ timeout: 15000 });
    }

    await this.purchaseCta.click();
  }
}
