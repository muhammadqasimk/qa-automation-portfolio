import { Page, Locator } from '@playwright/test';
import { ConduitBasePage } from './ConduitBasePage';

export class EditorPage extends ConduitBasePage {
  readonly titleInput: Locator;
  readonly aboutInput: Locator;
  readonly bodyInput: Locator;
  readonly tagsInput: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByPlaceholder('Article Title');
    this.aboutInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.tagsInput = page.getByPlaceholder('Enter tags');
    this.publishButton = page.getByRole('button', { name: /Publish Article/i });
  }

  async open(): Promise<void> {
    await this.goto('/editor');
  }

  async publishArticle(
    title: string,
    about: string,
    body: string,
    tag?: string
  ): Promise<void> {
    await this.titleInput.fill(title);
    await this.aboutInput.fill(about);
    await this.bodyInput.fill(body);
    if (tag) {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press('Enter');
    }
    await this.publishButton.click();
  }
}
