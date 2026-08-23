import { Page, Locator, expect } from '@playwright/test';
import { ConduitBasePage } from './ConduitBasePage';

export class ArticlePage extends ConduitBasePage {
  readonly title: Locator;
  readonly body: Locator;
  readonly commentInput: Locator;
  readonly postCommentButton: Locator;
  readonly comments: Locator;
  readonly deleteArticleButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.article-page h1').first();
    this.body = page.locator('.article-content');
    this.commentInput = page.getByPlaceholder('Write a comment...');
    this.postCommentButton = page.getByRole('button', { name: /Post Comment/i });
    this.comments = page.locator('.card .card-text');
    this.deleteArticleButton = page
      .getByRole('button', { name: /Delete Article/i })
      .first();
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.title).toHaveText(title);
  }

  async addComment(text: string): Promise<void> {
    await this.commentInput.fill(text);
    await this.postCommentButton.click();
  }

  async deleteArticle(): Promise<void> {
    await this.deleteArticleButton.click();
  }
}
