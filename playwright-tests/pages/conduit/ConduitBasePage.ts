import { Page, Locator, expect } from '@playwright/test';
import { URLS } from '../../config/urls';

/** Shared behaviour for all Conduit page objects. */
export abstract class ConduitBasePage {
  protected readonly page: Page;
  protected readonly baseUrl = URLS.conduit;

  // Global header links (present on every page)
  readonly homeLink: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;
  readonly newArticleLink: Locator;
  readonly settingsLink: Locator;

  protected constructor(page: Page) {
    this.page = page;
    this.homeLink = page.getByRole('link', { name: 'Home' });
    this.signInLink = page.getByRole('link', { name: 'Sign in' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.newArticleLink = page.getByRole('link', { name: /New Article/i });
    this.settingsLink = page.getByRole('link', { name: /Settings/i });
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.newArticleLink).toBeVisible();
    await expect(this.settingsLink).toBeVisible();
  }
}
