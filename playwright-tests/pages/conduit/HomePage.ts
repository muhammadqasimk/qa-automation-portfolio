import { Page, Locator, expect } from '@playwright/test';
import { ConduitBasePage } from './ConduitBasePage';

export class HomePage extends ConduitBasePage {
  readonly banner: Locator;
  readonly globalFeedTab: Locator;
  readonly articlePreviews: Locator;
  readonly popularTags: Locator;

  constructor(page: Page) {
    super(page);
    this.banner = page.locator('.banner');
    this.globalFeedTab = page.getByText('Global Feed', { exact: false });
    this.articlePreviews = page.locator('.article-preview');
    this.popularTags = page.locator('.tag-list .tag-default, .sidebar .tag-pill');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async openFirstArticle(): Promise<void> {
    await this.articlePreviews.first().getByRole('link', { name: /Read more/i }).click();
  }

  async articleCount(): Promise<number> {
    return this.articlePreviews.count();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.banner).toBeVisible();
  }
}
