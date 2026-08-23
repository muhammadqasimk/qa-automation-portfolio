import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../../pages/conduit/RegisterPage';
import { EditorPage } from '../../../pages/conduit/EditorPage';
import { ArticlePage } from '../../../pages/conduit/ArticlePage';
import { newUser, newArticle } from '../../../utils/testData';

/**
 * End-to-end journey against the live Conduit demo:
 * register -> publish an article -> comment on it -> delete it.
 */
test.describe('Conduit - Article lifecycle (E2E)', () => {
  test('register, publish, comment and delete an article', async ({ page }) => {
    const user = newUser();
    const article = newArticle();

    // 1. Register a fresh user (auto-logs in)
    const register = new RegisterPage(page);
    await register.open();
    await register.register(user.username, user.email, user.password);
    await register.expectLoggedIn();

    // 2. Publish a new article
    const editor = new EditorPage(page);
    await editor.open();
    await editor.publishArticle(article.title, article.about, article.body, article.tag);

    // 3. Verify the article page shows the published content
    const articlePage = new ArticlePage(page);
    await expect(page).toHaveURL(/\/article\//);
    await articlePage.expectTitle(article.title);

    // 4. Add a comment
    await articlePage.addComment('Great write-up, thanks for sharing!');
    await expect(
      page.getByText('Great write-up, thanks for sharing!')
    ).toBeVisible();

    // 5. Delete the article and confirm we leave the article page
    await articlePage.deleteArticle();
    await expect(page).not.toHaveURL(/\/article\//);
  });
});
