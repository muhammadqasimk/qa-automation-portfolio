import { Page, Locator } from '@playwright/test';
import { ConduitBasePage } from './ConduitBasePage';

export class SettingsPage extends ConduitBasePage {
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = page.getByRole('button', { name: /logout/i });
  }

  async open(): Promise<void> {
    await this.goto('/settings');
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
