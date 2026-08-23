import { Page, Locator, expect } from '@playwright/test';
import { ConduitBasePage } from './ConduitBasePage';

export class RegisterPage extends ConduitBasePage {
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.submitButton = page.getByRole('button', { name: /Sign up/i });
    this.errorMessages = page.locator('.error-messages li');
  }

  async open(): Promise<void> {
    await this.goto('/register');
  }

  async register(username: string, email: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
  }
}
